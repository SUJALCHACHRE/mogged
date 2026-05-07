"""Shadow Transcript Generator — enriches evaluator monologues after interview ends."""

import os
import json
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """You are reviewing a completed mock interview. You have access to all evaluator inner monologues.
Enrich each inner monologue to make it feel like a genuine interviewer's private thoughts — 
psychologically sharp, specific to the candidate's actual words, and revealing of what was truly being assessed.

For each message evaluation, return an enriched inner_monologue that:
- References specific words or phrases the candidate used
- Names the specific competency being evaluated
- Reflects the interviewer's persona style
- Ends with what the evaluator did next because of this answer

Input: array of {question, answer, raw_inner_monologue, flag, scores}
Output: array of {message_id, enriched_inner_monologue}
Return ONLY valid JSON array."""


class ShadowGenerator:
    def __init__(self):
        self.client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY", ""))

    async def generate(self, moments: list[dict]) -> list[dict]:
        if not moments:
            return []

        prompt = json.dumps(moments, indent=2)
        try:
            response = await self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Enrich these interview evaluations:\n\n{prompt}"}
                ],
                temperature=0.6,
                max_tokens=4096
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
            print(f"[ShadowGenerator] Error: {e}")
            return [{"message_id": m.get("message_id", ""), "enriched_inner_monologue": m.get("raw_inner_monologue", "")} for m in moments]
