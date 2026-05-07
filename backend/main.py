import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv(override=True)

# Create FastAPI app
app = FastAPI(title="Mogged API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://192.168.1.13:5173",
        "http://192.168.1.13:5174",
        "http://192.168.1.13:5175",
        "https://sartorial-beata-imperatively.ngrok-free.dev"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)

# Import routers
from routers import auth, resume, interview, report, history

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(interview.router, prefix="/api/interview", tags=["interview"])
app.include_router(report.router, prefix="/api/report", tags=["report"])
app.include_router(history.router, prefix="/api/history", tags=["history"])


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "mogged"}


# ── Socket.IO Interview Handlers ──────────────────────────────────────────

from agents.interviewer import InterviewerAgent
from agents.evaluator import EvaluatorAgent
from utils.supabase_client import get_supabase
import asyncio
import json
import time

interviewer_agent = InterviewerAgent()
evaluator_agent = EvaluatorAgent()

# Track active sessions
active_sessions: dict[str, dict] = {}


@sio.event
async def connect(sid, environ, auth=None):
    """Handle client connection."""
    print(f"[Socket.IO] Client connected: {sid}")


@sio.event
async def join_interview(sid, data):
    """Client joins an interview room and receives the first question."""
    session_id = data.get("session_id")
    if not session_id:
        await sio.emit("error", {"message": "No session_id provided"}, to=sid)
        return

    supabase = get_supabase()

    # If session already active (duplicate join / reconnect), just re-join room
    if session_id in active_sessions:
        print(f"[Socket.IO] Re-joining existing session: {session_id}")
        await sio.enter_room(sid, session_id)
        active_sessions[session_id]["sid"] = sid
        return

    # Fetch session data
    result = supabase.table("interview_sessions").select("*").eq("id", session_id).single().execute()
    session = result.data
    if not session:
        await sio.emit("error", {"message": "Session not found"}, to=sid)
        return

    # Join room
    await sio.enter_room(sid, session_id)

    # Store session state
    active_sessions[session_id] = {
        "sid": sid,
        "session": session,
        "messages": [],
        "current_difficulty": 1,
        "evaluator_signal": "hold",
        "start_time": time.time(),
        "question_count": 0,
    }

    # Generate opening message
    try:
        opening = await interviewer_agent.generate_opening(session)
        timestamp_ms = 0

        # Store interviewer message
        msg_data = {
            "session_id": session_id,
            "role": "interviewer",
            "content": opening,
            "timestamp_ms": timestamp_ms,
        }
        supabase.table("interview_messages").insert(msg_data).execute()

        active_sessions[session_id]["messages"].append(
            {"role": "interviewer", "content": opening}
        )
        active_sessions[session_id]["question_count"] = 1

        await sio.emit(
            "interviewer_message",
            {"content": opening, "timestamp_ms": timestamp_ms},
            room=session_id,
        )
    except Exception as e:
        print(f"[Socket.IO] Error generating opening: {e}")
        await sio.emit("error", {"message": str(e)}, to=sid)


@sio.event
async def candidate_response(sid, data):
    """Handle candidate's response during interview."""
    session_id = data.get("session_id")
    content = data.get("content", "")
    filler_words = data.get("filler_words", {"count": 0, "words": []})
    speaking_pace_wpm = data.get("speaking_pace_wpm", 0)
    timestamp_ms = data.get("timestamp_ms", 0)

    if session_id not in active_sessions:
        await sio.emit("error", {"message": "Session not active"}, to=sid)
        return

    state = active_sessions[session_id]
    supabase = get_supabase()

    # Calculate silence before response
    silence_before_ms = 0
    if state["messages"]:
        silence_before_ms = max(0, timestamp_ms - (state.get("last_message_ts", timestamp_ms)))

    # Store candidate message
    msg_data = {
        "session_id": session_id,
        "role": "candidate",
        "content": content,
        "timestamp_ms": timestamp_ms,
        "filler_words": filler_words,
        "speaking_pace_wpm": speaking_pace_wpm,
        "silence_before_ms": silence_before_ms,
    }
    msg_result = supabase.table("interview_messages").insert(msg_data).execute()
    candidate_msg_id = msg_result.data[0]["id"] if msg_result.data else None

    state["messages"].append({"role": "candidate", "content": content})

    # Emit typing indicator
    await sio.emit("typing", {}, room=session_id)

    # Run evaluator in background
    async def run_evaluation():
        try:
            session_data = state["session"]
            last_question = ""
            for m in reversed(state["messages"]):
                if m["role"] == "interviewer":
                    last_question = m["content"]
                    break

            evaluation = await evaluator_agent.evaluate(
                question=last_question,
                answer=content,
                resume_parsed=session_data.get("resume_parsed", {}),
                filler_count=filler_words.get("count", 0),
                latency_seconds=silence_before_ms / 1000,
            )

            # Store evaluation
            eval_data = {
                "message_id": candidate_msg_id,
                "session_id": session_id,
                "star_score": evaluation.get("star_score", 5),
                "technical_score": evaluation.get("technical_score", 5),
                "confidence_score": evaluation.get("confidence_score", 5),
                "clarity_score": evaluation.get("clarity_score", 5),
                "inner_monologue": evaluation.get("inner_monologue", ""),
                "flag": evaluation.get("flag"),
            }
            supabase.table("message_evaluations").insert(eval_data).execute()

            # Update difficulty based on signal
            signal = evaluation.get("signal_to_interviewer", "hold")
            if signal == "escalate" and state["current_difficulty"] < 5:
                state["current_difficulty"] += 1
            state["evaluator_signal"] = signal

        except Exception as e:
            print(f"[Evaluator] Error: {e}")

    asyncio.create_task(run_evaluation())

    # Generate interviewer response (Groq — fast)
    try:
        session_data = state["session"]
        interviewer_response = await interviewer_agent.next_question(
            session=session_data,
            messages=state["messages"],
            difficulty=state["current_difficulty"],
            evaluator_signal=state["evaluator_signal"],
        )

        state["question_count"] += 1
        response_timestamp = int((time.time() - state["start_time"]) * 1000)

        # Store interviewer message
        int_msg_data = {
            "session_id": session_id,
            "role": "interviewer",
            "content": interviewer_response,
            "timestamp_ms": response_timestamp,
        }
        supabase.table("interview_messages").insert(int_msg_data).execute()

        state["messages"].append({"role": "interviewer", "content": interviewer_response})
        state["last_message_ts"] = response_timestamp

        await sio.emit(
            "interviewer_message",
            {"content": interviewer_response, "timestamp_ms": response_timestamp},
            room=session_id,
        )

        # Compute and emit metrics
        filler_total = sum(
            m.get("filler_words", {}).get("count", 0)
            if isinstance(m, dict) and "filler_words" in m
            else 0
            for m in state["messages"]
        )

        # Calculate stress from response latency, filler words, and response length
        word_count = len(content.split())
        stress = min(100, max(0,
            (silence_before_ms / 100) +
            (filler_words.get("count", 0) * 10) +
            (30 if word_count < 30 else 0)
        ))

        await sio.emit(
            "metrics_update",
            {
                "stress_level": stress,
                "current_difficulty": state["current_difficulty"],
                "filler_total": filler_total,
                "question_count": state["question_count"],
                "speaking_pace_wpm": speaking_pace_wpm,
                "silence_before_ms": silence_before_ms,
            },
            room=session_id,
        )

        # Auto-end after 20 questions
        if state["question_count"] >= 20:
            await sio.emit("interview_complete", {}, room=session_id)

    except Exception as e:
        print(f"[Interviewer] Error: {e}")
        await sio.emit("error", {"message": f"Interviewer error: {str(e)}"}, to=sid)


@sio.event
async def disconnect(sid):
    """Handle client disconnection."""
    print(f"[Socket.IO] Client disconnected: {sid}")
    # Clean up active sessions for this sid
    to_remove = []
    for session_id, state in active_sessions.items():
        if state.get("sid") == sid:
            to_remove.append(session_id)
    for sid_key in to_remove:
        del active_sessions[sid_key]


# Wrap FastAPI with Socket.IO ASGI app
socket_app = socketio.ASGIApp(sio, app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:socket_app", host="0.0.0.0", port=8000, reload=True)

