"""JWT verification and auth utilities for FastAPI."""

import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer()

SUPABASE_JWT_SECRET = os.getenv("SECRET_KEY", "")
ALGORITHM = "HS256"


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Verify Supabase JWT and return user data."""
    token = credentials.credentials
    try:
        # Supabase JWTs use the project's JWT secret
        # For simplicity, we decode with our SECRET_KEY
        # In production, use the Supabase JWT secret from project settings
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=[ALGORITHM],
            options={"verify_aud": False},
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: no user ID",
            )
        return {"id": user_id, "email": payload.get("email", ""), "payload": payload}
    except JWTError:
        # If our key doesn't work, try to verify with Supabase directly
        # This is a fallback — in production you'd use the Supabase JWT secret
        try:
            from utils.supabase_client import get_supabase
            supabase = get_supabase()
            user = supabase.auth.get_user(token)
            if user and user.user:
                return {
                    "id": user.user.id,
                    "email": user.user.email or "",
                    "payload": {},
                }
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
