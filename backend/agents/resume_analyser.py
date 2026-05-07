"""Resume Analyser Agent — uses Gemini Flash 2.0 to extract structured data from resumes."""

import os
import json
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """You are an expert talent evaluator with 20 years of experience at top-tier companies. 
Analyse the provided resume and extract the following as structured JSON.

Return ONLY valid JSON, no markdown, no explanation:
{
  "name": string,
  "target_roles": [string],
  "core_skills": [string],
  "experience_summary": string,
  "key_claims": [
    {"claim": string, "years_experience": number, "verifiable": boolean}
  ],
  "probe_points": [
    {"area": string, "reason": string, "suggested_question": string}
  ],
  "potential_inconsistencies": [string],
  "strength_areas": [string],
  "gap_areas": [string]
}"""


class ResumeAnalyserAgent:
    def __init__(self):
        self.client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY", ""))

    async def analyse(self, resume_text: str) -> dict:
        try:
            response = await self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Analyse this resume:\n\n{resume_text}"}
                ],
                temperature=0.3,
                max_tokens=2048,
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
            return json.loads(text)
        except Exception as e:
            print(f"[ResumeAnalyser] Error: {e}")
            return {
                "name": "Unknown", "target_roles": [], "core_skills": [],
                "experience_summary": "Could not parse resume",
                "key_claims": [], "probe_points": [],
                "potential_inconsistencies": [], "strength_areas": [], "gap_areas": [],
            }
