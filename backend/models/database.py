"""Database helper utilities for Supabase table operations."""

from utils.supabase_client import get_supabase


def get_profile(user_id: str) -> dict | None:
    supabase = get_supabase()
    result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    return result.data


def update_profile(user_id: str, data: dict) -> dict | None:
    supabase = get_supabase()
    result = supabase.table("profiles").update(data).eq("id", user_id).execute()
    return result.data[0] if result.data else None


def create_session(data: dict) -> dict | None:
    supabase = get_supabase()
    result = supabase.table("interview_sessions").insert(data).execute()
    return result.data[0] if result.data else None


def get_session(session_id: str) -> dict | None:
    supabase = get_supabase()
    result = supabase.table("interview_sessions").select("*").eq("id", session_id).single().execute()
    return result.data


def update_session(session_id: str, data: dict) -> dict | None:
    supabase = get_supabase()
    result = supabase.table("interview_sessions").update(data).eq("id", session_id).execute()
    return result.data[0] if result.data else None


def get_session_messages(session_id: str) -> list[dict]:
    supabase = get_supabase()
    result = (
        supabase.table("interview_messages")
        .select("*")
        .eq("session_id", session_id)
        .order("timestamp_ms")
        .execute()
    )
    return result.data or []


def get_session_evaluations(session_id: str) -> list[dict]:
    supabase = get_supabase()
    result = (
        supabase.table("message_evaluations")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )
    return result.data or []


def get_user_sessions(user_id: str, limit: int = 20, offset: int = 0) -> list[dict]:
    supabase = get_supabase()
    result = (
        supabase.table("interview_sessions")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return result.data or []


def get_session_report(session_id: str) -> dict | None:
    supabase = get_supabase()
    result = (
        supabase.table("session_reports")
        .select("*")
        .eq("session_id", session_id)
        .single()
        .execute()
    )
    return result.data


def create_report(data: dict) -> dict | None:
    supabase = get_supabase()
    result = supabase.table("session_reports").insert(data).execute()
    return result.data[0] if result.data else None
