"""Auth routes."""

import os

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from models.database import get_profile
from utils.auth_utils import get_current_user
from utils.supabase_client import get_supabase

router = APIRouter()


class ConfirmEmailRequest(BaseModel):
    email: str


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Get current user's profile."""
    profile = get_profile(user["id"])
    if not profile:
        return {
            "id": user["id"],
            "email": user["email"],
            "full_name": None,
            "total_interviews": 0,
            "avg_score": 0,
        }
    return profile


@router.post("/confirm-email-dev")
async def confirm_email_dev(payload: ConfirmEmailRequest):
    """Confirm a Supabase email during local development."""
    email = payload.email.strip().lower()
    if "@" not in email:
        raise HTTPException(status_code=422, detail="Valid email is required")

    frontend_url = os.getenv("FRONTEND_URL", "")
    if "localhost" not in frontend_url and "127.0.0.1" not in frontend_url:
        raise HTTPException(status_code=403, detail="Dev email confirmation is disabled")

    supabase = get_supabase()
    users = supabase.auth.admin.list_users()
    target = next((u for u in users if (u.email or "").lower() == email), None)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    supabase.auth.admin.update_user_by_id(target.id, {"email_confirm": True})
    return {"status": "confirmed"}
