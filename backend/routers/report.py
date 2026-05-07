"""Report routes — fetch report and shadow transcript data."""

from fastapi import APIRouter, Depends, HTTPException
from utils.auth_utils import get_current_user
from models.database import get_session_report, get_session, get_session_messages, get_session_evaluations

router = APIRouter()


@router.get("/{session_id}")
async def get_report(
    session_id: str,
    user: dict = Depends(get_current_user),
):
    """Get full report for a session."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    report = get_session_report(session_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found. Interview may still be processing.")

    return {**report, "session": session}


@router.get("/{session_id}/shadow")
async def get_shadow_transcript(
    session_id: str,
    user: dict = Depends(get_current_user),
):
    """Get shadow transcript data — messages paired with evaluator inner monologues."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    messages = get_session_messages(session_id)
    evaluations = get_session_evaluations(session_id)

    # Build evaluation lookup by message_id
    eval_map = {}
    for ev in evaluations:
        eval_map[ev["message_id"]] = ev

    # Build paired moments chronologically
    moments = []
    last_question = ""
    
    for m in messages:
        if m["role"] == "interviewer":
            last_question = m["content"]
        elif m["role"] == "candidate":
            ev = eval_map.get(m["id"], {})
            moments.append({
                "question": last_question,
                "answer": m["content"],
                "inner_monologue": ev.get("inner_monologue", ""),
                "scores": {
                    "star": ev.get("star_score", 5),
                    "technical": ev.get("technical_score", 5),
                    "confidence": ev.get("confidence_score", 5),
                    "clarity": ev.get("clarity_score", 5),
                },
                "flag": ev.get("flag"),
                "timestamp_ms": m.get("timestamp_ms", 0),
                "filler_words": m.get("filler_words"),
            })

    return {
        "session_id": session_id,
        "persona_id": session.get("persona_id", ""),
        "target_role": session.get("target_role", ""),
        "moments": moments,
    }
