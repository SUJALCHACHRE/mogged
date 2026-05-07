import { create } from 'zustand';
import type { Message, InterviewMetrics } from '../types';
import { defaultMetrics } from '../types';

interface InterviewState {
  sessionId: string | null;
  messages: Message[];
  metrics: InterviewMetrics;
  isInterviewerTyping: boolean;
  isInterviewActive: boolean;
  startTime: number | null;

  setSessionId: (id: string) => void;
  addMessage: (msg: Message) => void;
  setMessages: (msgs: Message[]) => void;
  setMetrics: (metrics: InterviewMetrics) => void;
  setInterviewerTyping: (typing: boolean) => void;
  startInterview: () => void;
  endInterview: () => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  sessionId: null,
  messages: [],
  metrics: defaultMetrics,
  isInterviewerTyping: false,
  isInterviewActive: false,
  startTime: null,

  setSessionId: (id) => set({ sessionId: id }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setMessages: (messages) => set({ messages }),
  setMetrics: (metrics) => set({ metrics }),
  setInterviewerTyping: (isInterviewerTyping) => set({ isInterviewerTyping }),
  startInterview: () => set({ isInterviewActive: true, startTime: Date.now() }),
  endInterview: () => set({ isInterviewActive: false }),
  reset: () => set({
    sessionId: null, messages: [], metrics: defaultMetrics,
    isInterviewerTyping: false, isInterviewActive: false, startTime: null,
  }),
}));
