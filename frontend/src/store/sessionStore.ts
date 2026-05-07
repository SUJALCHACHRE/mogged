import { create } from 'zustand';
import type { ResumeAnalysis } from '../types';

interface SessionSetupState {
  step: number;
  resumeUrl: string | null;
  resumeAnalysis: ResumeAnalysis | null;
  targetRole: string;
  companyType: string;
  experienceLevel: string;
  selectedPersona: string | null;
  isAnalysing: boolean;

  setStep: (step: number) => void;
  setResumeUrl: (url: string) => void;
  setResumeAnalysis: (analysis: ResumeAnalysis) => void;
  setTargetRole: (role: string) => void;
  setCompanyType: (type: string) => void;
  setExperienceLevel: (level: string) => void;
  setSelectedPersona: (id: string) => void;
  setAnalysing: (val: boolean) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionSetupState>((set) => ({
  step: 1,
  resumeUrl: null,
  resumeAnalysis: null,
  targetRole: '',
  companyType: '',
  experienceLevel: 'Fresher',
  selectedPersona: null,
  isAnalysing: false,

  setStep: (step) => set({ step }),
  setResumeUrl: (resumeUrl) => set({ resumeUrl }),
  setResumeAnalysis: (resumeAnalysis) => set({ resumeAnalysis }),
  setTargetRole: (targetRole) => set({ targetRole }),
  setCompanyType: (companyType) => set({ companyType }),
  setExperienceLevel: (experienceLevel) => set({ experienceLevel }),
  setSelectedPersona: (selectedPersona) => set({ selectedPersona }),
  setAnalysing: (isAnalysing) => set({ isAnalysing }),
  reset: () => set({
    step: 1, resumeUrl: null, resumeAnalysis: null,
    targetRole: '', companyType: '', experienceLevel: 'Fresher',
    selectedPersona: null, isAnalysing: false,
  }),
}));
