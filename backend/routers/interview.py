"""Interview routes — session management and post-interview processing."""

from fastapi import APIRouter, Depends, HTTPException
from utils.auth_utils import get_current_user
from models.database import create_session, get_session, update_session, get_session_messages, get_session_evaluations
from models.schemas import InterviewCreateRequest
from agents.shadow_generator import ShadowGenerator
from agents.report_agent import ReportAgent
from utils.supabase_client import get_supabase
from datetime import datetime, timezone
import time
import httpx
import asyncio

async def send_webhook(webhook_url: str, payload: dict):
    try:
        print(f"[Webhook] Sending report to {webhook_url}")
        async with httpx.AsyncClient() as client:
            response = await client.post(webhook_url, json=payload, timeout=10.0)
            print(f"[Webhook] Response: {response.status_code} - {response.text}")
            
            # If the user strictly meant a GET request, let's try sending a minimal GET request as fallback
            if response.status_code == 405 or response.status_code == 404:
                print(f"[Webhook] POST failed, trying GET fallback...")
                email = payload.get("email", "")
                await client.get(f"{webhook_url}?email={email}", timeout=10.0)
                print(f"[Webhook] GET fallback sent for email: {email}")

    except Exception as e:
        print(f"[Webhook] Error sending report to webhook: {e}")

router = APIRouter()
shadow_gen = ShadowGenerator()
report_agent = ReportAgent()


@router.post("/create")
async def create_interview(
    data: InterviewCreateRequest,
    user: dict = Depends(get_current_user),
):
    """Create a new interview session."""
    session_data = {
        "user_id": user["id"],
        "persona_id": data.persona_id,
        "target_role": data.target_role,
        "company_type": data.company_type,
        "resume_parsed": data.resume_parsed,
        "resume_url": data.resume_url,
        "status": "active",
    }
    session = create_session(session_data)
    if not session:
        raise HTTPException(status_code=500, detail="Failed to create session")
    return session


@router.get("/{session_id}")
async def get_interview(
    session_id: str,
    user: dict = Depends(get_current_user),
):
    """Get interview session data."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return session


@router.post("/{session_id}/end")
async def end_interview(
    session_id: str,
    user: dict = Depends(get_current_user),
):
    """End an interview session and trigger post-processing."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Calculate duration
    started_at = session.get("started_at", "")
    duration = 0
    if started_at:
        try:
            start = datetime.fromisoformat(started_at.replace("Z", "+00:00"))
            duration = int((datetime.now(timezone.utc) - start).total_seconds())
        except Exception:
            duration = 0

    update_session(session_id, {
        "status": "completed",
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "duration_seconds": duration,
    })

    # Get messages and evaluations
    messages = get_session_messages(session_id)
    evaluations = get_session_evaluations(session_id)

    # Run Shadow Generator
    try:
        moments = []
        candidate_msgs = [m for m in messages if m["role"] == "candidate"]
        interviewer_msgs = [m for m in messages if m["role"] == "interviewer"]

        for i, cm in enumerate(candidate_msgs):
            question = interviewer_msgs[i]["content"] if i < len(interviewer_msgs) else ""
            matching_eval = None
            for ev in evaluations:
                if ev.get("message_id") == cm["id"]:
                    matching_eval = ev
                    break

            moments.append({
                "message_id": cm["id"],
                "question": question,
                "answer": cm["content"],
                "raw_inner_monologue": matching_eval.get("inner_monologue", "") if matching_eval else "",
                "flag": matching_eval.get("flag") if matching_eval else None,
                "scores": {
                    "star": matching_eval.get("star_score", 5) if matching_eval else 5,
                    "technical": matching_eval.get("technical_score", 5) if matching_eval else 5,
                    "confidence": matching_eval.get("confidence_score", 5) if matching_eval else 5,
                    "clarity": matching_eval.get("clarity_score", 5) if matching_eval else 5,
                },
            })

        enriched = await shadow_gen.generate(moments)

        # Update evaluations with enriched monologues
        supabase = get_supabase()
        for item in enriched:
            msg_id = item.get("message_id", "")
            enriched_text = item.get("enriched_inner_monologue", "")
            if msg_id and enriched_text:
                supabase.table("message_evaluations").update(
                    {"inner_monologue": enriched_text}
                ).eq("message_id", msg_id).execute()
    except Exception as e:
        print(f"[EndInterview] Shadow generation error: {e}")

    # Run Report Agent
    try:
        resume_parsed = session.get("resume_parsed", {}) or {}
        report_data = await report_agent.generate(session, evaluations, messages, resume_parsed)

        report_record = {
            "session_id": session_id,
            "user_id": user["id"],
            "overall_score": report_data.get("overall_score", 50),
            "technical_score": report_data.get("technical_score", 50),
            "communication_score": report_data.get("communication_score", 50),
            "confidence_score": report_data.get("confidence_score", 50),
            "star_compliance_score": report_data.get("star_compliance_score", 50),
            "total_filler_words": report_data.get("total_filler_words", 0),
            "avg_speaking_pace_wpm": report_data.get("avg_speaking_pace_wpm", 0),
            "longest_silence_ms": report_data.get("longest_silence_ms", 0),
            "top_strengths": report_data.get("top_strengths", []),
            "critical_gaps": report_data.get("critical_gaps", []),
            "improvement_actions": report_data.get("improvement_actions", []),
            "next_recommended_persona": report_data.get("next_recommended_persona", ""),
            "full_report_markdown": report_data.get("full_report_markdown", ""),
        }

        supabase = get_supabase()
        supabase.table("session_reports").insert(report_record).execute()

        # Update session with overall score
        update_session(session_id, {
            "overall_score": report_data.get("overall_score", 50),
            "percentile_rank": report_data.get("percentile_rank", 50),
        })

        # Update user profile stats
        profile_sessions = supabase.table("interview_sessions").select("overall_score").eq("user_id", user["id"]).eq("status", "completed").execute()
        if profile_sessions.data:
            scores = [s["overall_score"] for s in profile_sessions.data if s.get("overall_score")]
            avg = sum(scores) / len(scores) if scores else 0
            supabase.table("profiles").update({
                "total_interviews": len(profile_sessions.data),
                "avg_score": round(avg, 1),
            }).eq("id", user["id"]).execute()

        # Send report to webhook
        webhook_url = "https://sujalchachre89599.app.n8n.cloud/webhook/0a43b4d6-650f-4d9a-9039-2c80d43c9651"
        webhook_payload = {
            "email": user.get("email", ""),
            "report": report_record
        }
        asyncio.create_task(send_webhook(webhook_url, webhook_payload))

    except Exception as e:
        print(f"[EndInterview] Report generation error: {e}")

    return {"status": "completed", "session_id": session_id}
