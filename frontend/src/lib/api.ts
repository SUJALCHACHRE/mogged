import axios from 'axios';
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || '';
const api = axios.create({
  baseURL: API_URL ? `${API_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach Supabase auth token to all requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────
export const getMe = () => api.get('/auth/me').then(r => r.data);

export const confirmEmailForDev = (email: string) =>
  api.post('/auth/confirm-email-dev', { email }).then(r => r.data);

// ── Resume ────────────────────────────────────────────────────────────────
export const uploadResume = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

export const analyseResume = (resumeUrl: string, userId: string) =>
  api.post('/resume/analyse', { resume_url: resumeUrl, user_id: userId }).then(r => r.data);

// ── Interview ─────────────────────────────────────────────────────────────
export const createInterview = (data: {
  user_id: string;
  persona_id: string;
  target_role: string;
  company_type: string;
  resume_parsed?: object;
  resume_url?: string;
}) => api.post('/interview/create', data).then(r => r.data);

export const getInterview = (id: string) =>
  api.get(`/interview/${id}`).then(r => r.data);

export const endInterview = (id: string) =>
  api.post(`/interview/${id}/end`).then(r => r.data);

// ── Report ────────────────────────────────────────────────────────────────
export const getReport = (sessionId: string) =>
  api.get(`/report/${sessionId}`).then(r => r.data);

export const getShadowTranscript = (sessionId: string) =>
  api.get(`/report/${sessionId}/shadow`).then(r => r.data);

export const askReportQuestion = (sessionId: string, messages: any[]) =>
  api.post(`/report/${sessionId}/chat`, { messages }).then(r => r.data);

// ── History ───────────────────────────────────────────────────────────────
export const getHistory = (userId: string, limit = 20, offset = 0) =>
  api.get(`/history/${userId}?limit=${limit}&offset=${offset}`).then(r => r.data);

export default api;
