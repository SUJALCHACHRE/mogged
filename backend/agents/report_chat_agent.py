"""Report Chat Agent — answers candidate questions based on the interview report."""

import os
import json
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """You are an elite, highly empathetic and technical interview coach.
The candidate has just completed an interview and received their report.
They will ask you questions about their performance, strengths, weaknesses, and how to improve.
Use the provided interview report and context to give detailed, actionable, and encouraging feedback.
If the candidate asks something not covered in the report, provide general best practices but ground it in their role.

Always be direct, specific, and format your response in readable markdown. Use bullet points and bold text where appropriate.

Report Context:
{report_context}
"""

class ReportChatAgent:
    def __init__(self):
        self.client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY", ""))

    async def chat(self, report_data: dict, messages: list) -> str:
        """
        Chat with the candidate.
        messages: [{"role": "user" | "assistant", "content": "..."}]
        """
        # Create a clean context string without overly massive data
        context_data = {
            "overall_score": report_data.get("overall_score"),
            "target_role": report_data.get("session", {}).get("target_role"),
            "top_strengths": report_data.get("top_strengths"),
            "critical_gaps": report_data.get("critical_gaps"),
            "improvement_actions": report_data.get("improvement_actions"),
        }
        
        system_msg = SYSTEM_PROMPT.format(report_context=json.dumps(context_data, indent=2))
        
        # Format messages for Groq
        groq_messages = [{"role": "system", "content": system_msg}]
        
        for msg in messages:
            # Ensure roles are 'user' or 'assistant'
            role = msg.get("role")
            if role not in ["user", "assistant"]:
                continue
            groq_messages.append({
                "role": role,
                "content": msg.get("content", "")
            })

        try:
            response = await self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=groq_messages,
                temperature=0.7,
                max_tokens=2048,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"[ReportChatAgent] Error: {e}")
            return "I'm sorry, I'm having trouble analyzing your report right now. Please try again in a moment."
