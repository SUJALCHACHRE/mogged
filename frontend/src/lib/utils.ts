import type { Persona } from '../types';

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatTimer(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function getScoreColor(score: number): string {
  if (score >= 75) return '#14B8A6';
  if (score >= 50) return '#F59E0B';
  return '#F43F5E';
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'BRUTAL': return '#F43F5E';
    case 'HARD': return '#F59E0B';
    case 'MEDIUM': return '#14B8A6';
    default: return '#8B8AA8';
  }
}

export const PERSONAS: Persona[] = [
  {
    id: 'google_shark',
    name: 'The Shark',
    codeName: 'google_shark',
    companyType: 'FAANG / Big Tech',
    difficulty: 'BRUTAL',
    color: '#3B82F6',
    traits: ['Interrupts vague answers', 'Demands Big-O for everything', 'Silence as pressure'],
    description: 'Cold, methodical, FAANG-trained. Cares only about algorithmic precision and system design scalability.',
  },
  {
    id: 'startup_founder',
    name: 'The Chaos Founder',
    codeName: 'startup_founder',
    companyType: 'Early-Stage Startup',
    difficulty: 'HARD',
    color: '#F59E0B',
    traits: ['Unpredictable pivots', 'Culture-fit obsession', 'Tests conviction, not just knowledge'],
    description: 'Early-stage startup founder. Asks weird left-field questions. Cares deeply about ownership mentality.',
  },
  {
    id: 'hr_trap',
    name: 'The HR Architect',
    codeName: 'hr_trap',
    companyType: 'Enterprise / MNC',
    difficulty: 'HARD',
    color: '#EC4899',
    traits: ['STAR method trapper', 'Inconsistency detector', 'Reads between every line'],
    description: '15 years in HR. Has heard every rehearsed answer. Weaponizes behavioral questions.',
  },
  {
    id: 'hostile_skeptic',
    name: 'The Skeptic',
    codeName: 'hostile_skeptic',
    companyType: 'Any Company',
    difficulty: 'BRUTAL',
    color: '#F43F5E',
    traits: ['Challenges everything', 'Tests under pressure', 'No validation, ever'],
    description: 'Challenges every answer. Tests resilience and conviction. Designed to simulate hostility.',
  },
  {
    id: 'distracted_senior',
    name: 'The Distracted Senior',
    codeName: 'distracted_senior',
    companyType: 'Large Tech / Enterprise',
    difficulty: 'MEDIUM',
    color: '#14B8A6',
    traits: ['Tests executive presence', 'Simulates low engagement', 'Rewards confident redirection'],
    description: 'VP-level, half-paying attention. Tests whether you can command a room even when ignored.',
  },
];

export function getPersonaById(id: string): Persona | undefined {
  return PERSONAS.find(p => p.id === id);
}

export const FILLER_WORDS = ['um', 'uh', 'like', 'basically', 'literally', 'you know', 'sort of', 'kind of', 'right', 'so', 'actually', 'honestly'];
