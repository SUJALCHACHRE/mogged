// ── User & Auth ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  total_interviews: number;
  avg_score: number;
  created_at: string;
}

// ── Persona ──────────────────────────────────────────────────────────────

export interface Persona {
  id: string;
  name: string;
  codeName: string;
  companyType: string;
  difficulty: 'BRUTAL' | 'HARD' | 'MEDIUM';
  color: string;
  traits: string[];
  description: string;
}

// ── Interview Session ────────────────────────────────────────────────────

export interface InterviewSession {
  id: string;
  user_id: string;
  persona_id: string;
  target_role: string;
  company_type: string;
  resume_url: string | null;
  resume_parsed: ResumeAnalysis | null;
  status: 'active' | 'completed' | 'abandoned';
  overall_score: number | null;
  percentile_rank: number | null;
  duration_seconds: number | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

// ── Messages ─────────────────────────────────────────────────────────────

export interface FillerWordData {
  count: number;
  words: { word: string; count: number }[];
}

export interface Message {
  id?: string;
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp_ms: number;
  filler_words?: FillerWordData;
  speaking_pace_wpm?: number;
  silence_before_ms?: number;
}

// ── Resume ───────────────────────────────────────────────────────────────

export interface ResumeAnalysis {
  name: string;
  target_roles: string[];
  core_skills: string[];
  experience_summary: string;
  key_claims: { claim: string; years_experience: number; verifiable: boolean }[];
  probe_points: { area: string; reason: string; suggested_question: string }[];
  potential_inconsistencies: string[];
  strength_areas: string[];
  gap_areas: string[];
}

// ── Evaluations ──────────────────────────────────────────────────────────

export interface MessageEvaluation {
  id: string;
  message_id: string;
  session_id: string;
  star_score: number;
  technical_score: number;
  confidence_score: number;
  clarity_score: number;
  inner_monologue: string;
  flag: string | null;
}

// ── Shadow Transcript ────────────────────────────────────────────────────

export interface ShadowMoment {
  question: string;
  answer: string;
  inner_monologue: string;
  scores: {
    star: number;
    technical: number;
    confidence: number;
    clarity: number;
  };
  flag: string | null;
  timestamp_ms: number;
  filler_words?: FillerWordData;
}

export interface ShadowTranscript {
  session_id: string;
  persona_id: string;
  target_role: string;
  moments: ShadowMoment[];
}

// ── Report ───────────────────────────────────────────────────────────────

export interface SessionReport {
  id: string;
  session_id: string;
  user_id: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  star_compliance_score: number;
  total_filler_words: number;
  avg_speaking_pace_wpm: number;
  longest_silence_ms: number;
  top_strengths: string[];
  critical_gaps: string[];
  improvement_actions: { action: string; priority: string; exercise: string }[];
  next_recommended_persona: string;
  full_report_markdown: string;
  session?: InterviewSession;
}

// ── Metrics ──────────────────────────────────────────────────────────────

export interface InterviewMetrics {
  stress_level: number;
  current_difficulty: number;
  filler_total: number;
  question_count: number;
  speaking_pace_wpm: number;
  silence_before_ms: number;
}

export const defaultMetrics: InterviewMetrics = {
  stress_level: 0,
  current_difficulty: 1,
  filler_total: 0,
  question_count: 0,
  speaking_pace_wpm: 0,
  silence_before_ms: 0,
};
