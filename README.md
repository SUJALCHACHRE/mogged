# Mogged

Mogged is an interview prep app built to feel less like a checklist and more like a real room. It combines an adaptive mock interviewer, live delivery signals, resume-aware prompting, and post-interview reporting so candidates can practice, review, and tighten the story they tell.

## What it does

- Runs structured mock interviews with persona-based questioning
- Tracks delivery signals like confidence, filler words, pacing, and response latency
- Produces a scored report with strengths, gaps, and next-step drills
- Shows a shadow transcript so you can see the hidden evaluation layer
- Lets you chat with the report after the interview to dig into specific moments
- Uses Supabase for auth and data, FastAPI for the backend, and React + Vite for the frontend

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, Framer Motion, GSAP
- Backend: FastAPI, Socket.IO, Python
- AI / LLM: llama-3.3-70b-versatile
- Data and auth: Supabase

## Project Layout

- `frontend/` - Vite app, UI, pages, and client-side state
- `backend/` - FastAPI app, interview and report routers, agents, and utilities
- `database.sql` - database schema and seed data
- `render.yaml` - Render deployment config for the backend
- `graph.html` - generated visual asset included with the project

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/SUJALCHACHRE/mogged.git
cd mogged
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/` with the values your app needs:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=http://localhost:5173
```

Run the backend:

```bash
uvicorn main:socket_app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:8000
```

Run the frontend:

```bash
npm run dev
```

## Build

```bash
cd frontend
npm run build
```

For a quick backend syntax check:

```bash
python -m compileall backend
```

## Deployment Notes

- The backend is configured for Render in `render.yaml`
- Set `FRONTEND_URL` to your deployed frontend origin in the Render dashboard
- Keep `SUPABASE_URL`, `SUPABASE_KEY`, and `GROQ_API_KEY` as secrets in your deployment environment

## How It Fits Together

1. A user signs in through Supabase.
2. The frontend creates or resumes an interview session.
3. Socket.IO streams interview prompts and candidate responses.
4. The backend scores the response, stores the result, and updates session metrics.
5. The report view pulls the final session summary, shadow transcript, and follow-up chat context.
