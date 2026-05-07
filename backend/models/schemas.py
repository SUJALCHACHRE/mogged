from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────

class UserProfile(BaseModel):
    id: str
    full_name: Optional[str] = None
    email: str
    avatar_url: Optional[str] = None
    total_interviews: int = 0
    avg_score: float = 0
    created_at: Optional[str] = None


# ── Resume ────────────────────────────────────────────────────────────────

class ResumeAnalysis(BaseModel):
    name: Optional[str] = None
    target_roles: list[str] = []
    core_skills: list[str] = []
    experience_summary: Optional[str] = None
    key_claims: list[dict] = []
    probe_points: list[dict] = []
    potential_inconsistencies: list[str] = []
    strength_areas: list[str] = []
    gap_areas: list[str] = []


class ResumeUploadResponse(BaseModel):
    resume_url: str
    message: str = "Resume uploaded successfully"


class ResumeAnalyseRequest(BaseModel):
    resume_url: str
    user_id: str


# ── Interview Session ─────────────────────────────────────────────────────

class InterviewCreateRequest(BaseModel):
    user_id: str
    persona_id: str
    target_role: str
    company_type: str
    resume_parsed: Optional[dict] = None
    resume_url: Optional[str] = None


class InterviewSession(BaseModel):
    id: str
    user_id: str
    persona_id: str
    target_role: str
    company_type: str
    resume_url: Optional[str] = None
    resume_parsed: Optional[dict] = None
    status: str = "active"
    overall_score: Optional[float] = None
    percentile_rank: Optional[float] = None
    duration_seconds: Optional[int] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


# ── Messages ──────────────────────────────────────────────────────────────

class InterviewMessage(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    timestamp_ms: int
    filler_words: Optional[dict] = None
    speaking_pace_wpm: Optional[int] = None
    silence_before_ms: Optional[int] = None


# ── Evaluations ───────────────────────────────────────────────────────────

class MessageEvaluation(BaseModel):
    id: str
    message_id: str
    session_id: str
    star_score: Optional[float] = None
    technical_score: Optional[float] = None
    confidence_score: Optional[float] = None
    clarity_score: Optional[float] = None
    inner_monologue: Optional[str] = None
    flag: Optional[str] = None


# ── Report ────────────────────────────────────────────────────────────────

class SessionReport(BaseModel):
    id: Optional[str] = None
    session_id: str
    user_id: str
    overall_score: Optional[float] = None
    technical_score: Optional[float] = None
    communication_score: Optional[float] = None
    confidence_score: Optional[float] = None
    star_compliance_score: Optional[float] = None
    total_filler_words: Optional[int] = None
    avg_speaking_pace_wpm: Optional[int] = None
    longest_silence_ms: Optional[int] = None
    top_strengths: Optional[list] = None
    critical_gaps: Optional[list] = None
    improvement_actions: Optional[list] = None
    next_recommended_persona: Optional[str] = None
    full_report_markdown: Optional[str] = None


# ── Shadow Transcript ─────────────────────────────────────────────────────

class ShadowMoment(BaseModel):
    question: str
    answer: str
    inner_monologue: str
    scores: dict
    flag: Optional[str] = None
    timestamp_ms: int = 0
    filler_words: Optional[dict] = None


class ShadowTranscript(BaseModel):
    session_id: str
    persona_id: str
    target_role: str
    moments: list[ShadowMoment] = []
