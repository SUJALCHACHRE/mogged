"""Report Agent — generates comprehensive post-interview report using Gemini Flash 2.0."""

import os
import json
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """You are an elite interview coach reviewing a complete interview session.
Generate a comprehensive debrief report based on the data provided.

Return ONLY valid JSON:
{
  "overall_score": float (0-100),
  "percentile_rank": float (0-100),
  "technical_score": float (0-100),
  "communication_score": float (0-100),
  "confidence_score": float (0-100),
  "star_compliance_score": float (0-100),
  "top_strengths": [string],
  "critical_gaps": [string],
  "improvement_actions": [
    {
      "action": string,
      "priority": "critical" or "important" or "suggested",
      "exercise": string
    }
  ],
  "vocal_analysis_summary": string,
  "star_compliance_assessment": string,
  "next_recommended_persona": string,
  "full_report_markdown": string
}"""


class ReportAgent:
    def __init__(self):
        self.client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY", ""))

    async def generate(self, session: dict, evaluations: list, messages: list, resume_parsed: dict) -> dict:
        filler_total = 0
        pace_values = []
        silence_values = []
        for msg in messages:
            if msg.get("role") == "candidate":
                fw = msg.get("filler_words")
                if isinstance(fw, dict):
                    filler_total += fw.get("count", 0)
                if msg.get("speaking_pace_wpm"):
                    pace_values.append(msg["speaking_pace_wpm"])
                if msg.get("silence_before_ms"):
                    silence_values.append(msg["silence_before_ms"])

        session_summary = {
            "persona_id": session.get("persona_id"),
            "target_role": session.get("target_role"),
            "company_type": session.get("company_type"),
            "total_questions": len([m for m in messages if m.get("role") == "interviewer"]),
            "total_responses": len([m for m in messages if m.get("role") == "candidate"]),
            "duration_seconds": session.get("duration_seconds", 0),
        }

        filler_stats = {
            "total_filler_words": filler_total,
            "avg_speaking_pace_wpm": int(sum(pace_values) / len(pace_values)) if pace_values else 0,
            "longest_silence_ms": max(silence_values) if silence_values else 0,
        }

        prompt = f"""Session data: {json.dumps(session_summary)}
All evaluations: {json.dumps(evaluations[:15])}
Filler word stats: {json.dumps(filler_stats)}
Resume: {json.dumps(resume_parsed)}

Generate the comprehensive interview report now."""

        try:
            response = await self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=4096,
                response_format={"type": "json_object"}
            )
            text = response.choices[0].message.content.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            if text.startswith("json"):
                text = text[4:].strip()
            result = json.loads(text)
            result["total_filler_words"] = filler_total
            result["avg_speaking_pace_wpm"] = filler_stats["avg_speaking_pace_wpm"]
            result["longest_silence_ms"] = filler_stats["longest_silence_ms"]
            return result
        except Exception as e:
            print(f"[ReportAgent] Error: {e}")
            return {
                "overall_score": 50, "percentile_rank": 50,
                "technical_score": 50, "communication_score": 50,
                "confidence_score": 50, "star_compliance_score": 50,
                "top_strengths": ["Unable to generate"], "critical_gaps": ["Unable to generate"],
                "improvement_actions": [], "vocal_analysis_summary": "",
                "star_compliance_assessment": "", "next_recommended_persona": "google_shark",
                "full_report_markdown": "Report generation failed.",
                "total_filler_words": filler_total,
                "avg_speaking_pace_wpm": filler_stats["avg_speaking_pace_wpm"],
                "longest_silence_ms": filler_stats["longest_silence_ms"],
            }
