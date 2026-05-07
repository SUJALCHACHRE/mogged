-- Mirror Mode — Supabase Database Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  total_interviews INT DEFAULT 0,
  avg_score FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview sessions
CREATE TABLE public.interview_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  persona_id TEXT NOT NULL,
  target_role TEXT NOT NULL,
  company_type TEXT NOT NULL,
  resume_url TEXT,
  resume_parsed JSONB,
  status TEXT DEFAULT 'active',
  overall_score FLOAT,
  percentile_rank FLOAT,
  duration_seconds INT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual interview messages
CREATE TABLE public.interview_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp_ms INT NOT NULL,
  filler_words JSONB,
  speaking_pace_wpm INT,
  silence_before_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evaluator scores per message
CREATE TABLE public.message_evaluations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID REFERENCES public.interview_messages(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE NOT NULL,
  star_score FLOAT,
  technical_score FLOAT,
  confidence_score FLOAT,
  clarity_score FLOAT,
  inner_monologue TEXT,
  flag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Final session report
CREATE TABLE public.session_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  overall_score FLOAT,
  technical_score FLOAT,
  communication_score FLOAT,
  confidence_score FLOAT,
  star_compliance_score FLOAT,
  total_filler_words INT,
  avg_speaking_pace_wpm INT,
  longest_silence_ms INT,
  top_strengths JSONB,
  critical_gaps JSONB,
  improvement_actions JSONB,
  next_recommended_persona TEXT,
  full_report_markdown TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own sessions" ON public.interview_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own messages" ON public.interview_messages FOR ALL USING (
  session_id IN (SELECT id FROM public.interview_sessions WHERE user_id = auth.uid())
);
CREATE POLICY "Users can view own evaluations" ON public.message_evaluations FOR ALL USING (
  session_id IN (SELECT id FROM public.interview_sessions WHERE user_id = auth.uid())
);
CREATE POLICY "Users can view own reports" ON public.session_reports FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
CREATE POLICY "Users upload own resumes" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users read own resumes" ON storage.objects FOR SELECT USING (
  bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
