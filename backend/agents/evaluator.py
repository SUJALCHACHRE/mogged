"""Evaluator Agent — uses Gemini Flash 2.0 to silently score each candidate response."""

import os
import json
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """You are a silent evaluation system running in parallel with a live interview. 
Evaluate the candidate's response and return ONLY valid JSON:

{
  "star_score": float (0-10),
  "technical_score": float (0-10),
  "confidence_score": float (0-10),
  "clarity_score": float (0-10),
  "inner_monologue": string,
  "flag": string or null,
  "signal_to_interviewer": string
}

For inner_monologue: Write 2-3 sentences of what the interviewer would ACTUALLY be thinking right now. Be specific, psychologically sharp, and honest.
For flag: Use one of "resume_inconsistency", "strong_answer", "escalate_difficulty", "probe_deeper", "filler_spike", or null.
For signal_to_interviewer: Use "escalate", "hold", "probe_inconsistency", or "wrap_up"."""


class EvaluatorAgent:
    def __init__(self):
        self.client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY", ""))

    async def evaluate(
        self,
        question: str,
        answer: str,
        resume_parsed: dict,
        filler_count: int = 0,
        latency_seconds: float = 0,
    ) -> dict:
        claims = resume_parsed.get("key_claims", [])
        claims_str = json.dumps(claims) if claims else "No claims"

        prompt = f"""Resume claims: {claims_str}
Question asked: {question}
Candidate's answer: {answer}
Filler word count: {filler_count}
Response latency (seconds): {latency_seconds}

Evaluate this response now."""

        try:
            response = await self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                max_tokens=1024,
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
            print(f"[Evaluator] Error: {e}")
            return {
                "star_score": 5, "technical_score": 5,
                "confidence_score": 5, "clarity_score": 5,
                "inner_monologue": "Evaluating response...",
                "flag": None, "signal_to_interviewer": "hold",
            }
