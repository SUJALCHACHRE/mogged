"""History routes — paginated list of past sessions."""

from fastapi import APIRouter, Depends
from utils.auth_utils import get_current_user
from models.database import get_user_sessions

router = APIRouter()


@router.get("/{user_id}")
async def get_history(
    user_id: str,
    limit: int = 20,
    offset: int = 0,
    user: dict = Depends(get_current_user),
):
    """Get paginated list of interview sessions for a user."""
    # Users can only view their own history
    if user["id"] != user_id:
        user_id = user["id"]

    sessions = get_user_sessions(user_id, limit=limit, offset=offset)
    return {"sessions": sessions, "total": len(sessions)}
