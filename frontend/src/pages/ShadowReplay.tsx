import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Play, Pause, ArrowRight, Share2 } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ShadowReplayCard, TypewriterText } from '../components/interview/ShadowReplay';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { getShadowTranscript } from '../lib/api';
import { getPersonaById, getScoreColor } from '../lib/utils';
import type { ShadowTranscript, ShadowMoment } from '../types';

export default function ShadowReplayPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [introPhase, setIntroPhase] = useState(0);
  const [introComplete, setIntroComplete] = useState(false);
  const [activeMoment, setActiveMoment] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const { data, isLoading } = useQuery<ShadowTranscript>({
    queryKey: ['shadow', sessionId],
    queryFn: () => getShadowTranscript(sessionId || ''),
    enabled: !!sessionId,
  });

  // Cinematic intro sequence
  useEffect(() => {
    const timers = [
      setTimeout(() => setIntroPhase(1), 500),
      setTimeout(() => setIntroPhase(2), 3000),
      setTimeout(() => setIntroPhase(3), 5500),
      setTimeout(() => { setIntroPhase(4); setIntroComplete(true); }, 7500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || !data?.moments.length) return;
    const interval = setInterval(() => {
      setActiveMoment((prev) => {
        if (prev >= (data?.moments.length || 0) - 1) {
          setIsAutoPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, data?.moments.length]);

  const persona = getPersonaById(data?.persona_id || '');
  const moments = data?.moments || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <Loader text="Loading Shadow Transcript..." />
      </div>
    );
  }

  // Cinematic Intro
  if (!introComplete) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <AnimatePresence mode="wait">
          {introPhase === 1 && (
            <motion.p
              key="intro1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="text-2xl md:text-3xl text-[var(--text-primary)] font-light text-center px-6"
            >
              Every interviewer has a hidden scorecard.
            </motion.p>
          )}
          {introPhase === 2 && (
            <motion.p
              key="intro2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="text-2xl md:text-3xl text-[var(--text-primary)] font-light text-center px-6"
            >
              You've never seen yours.
            </motion.p>
          )}
          {introPhase === 3 && (
            <motion.p
              key="intro3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-4xl text-brand-purple-light font-light italic text-center px-6"
            >
              Until now.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <PageWrapper className="min-h-screen bg-void">
      <div className="flex h-screen">
        {/* Left — Timeline */}
        <div className="w-72 shrink-0 border-r border-[var(--border-subtle)] overflow-y-auto p-4 hidden md:block">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-label text-[var(--text-muted)]">Timeline</h2>
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="text-[var(--text-muted)] hover:text-brand-purple transition-colors"
            >
              {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>

          <div className="space-y-1">
            {moments.map((moment, i) => {
              const avgScore = (moment.scores.star + moment.scores.technical + moment.scores.confidence + moment.scores.clarity) / 4;
              const dotColor = getScoreColor(avgScore * 10);
              const isActive = i === activeMoment;

              return (
                <button
                  key={i}
                  onClick={() => setActiveMoment(i)}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-elevated border border-brand-purple/30'
                      : 'hover:bg-elevated/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1 mt-1 shrink-0">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: dotColor,
                        boxShadow: isActive ? `0 0 12px ${dotColor}` : 'none',
                      }}
                    />
                    {i < moments.length - 1 && (
                      <div className="w-px h-6 bg-[var(--border-subtle)]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--text-muted)]">Q{i + 1}</p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{moment.question.slice(0, 50)}...</p>
                    {moment.flag && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block"
                        style={{ backgroundColor: `${dotColor}15`, color: dotColor }}>
                        {moment.flag.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right — Replay Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-title text-[var(--text-primary)]">Shadow Transcript</h1>
                <p className="text-sm text-[var(--text-muted)]">
                  {persona?.name || 'Interviewer'} · {data?.target_role} · {moments.length} moments
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {activeMoment + 1} / {moments.length}
                </span>
              </div>
            </div>

            {/* Mobile timeline nav */}
            <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
              {moments.map((m, i) => {
                const avg = (m.scores.star + m.scores.technical + m.scores.confidence + m.scores.clarity) / 4;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveMoment(i)}
                    className={`shrink-0 w-8 h-8 rounded-full text-xs font-medium transition-all ${
                      i === activeMoment ? 'bg-brand-purple text-white' : 'bg-elevated text-[var(--text-muted)]'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Active Moment */}
            <AnimatePresence mode="wait">
              {moments[activeMoment] && (
                <motion.div
                  key={activeMoment}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Question */}
                  <div className="mb-4">
                    <p className="text-label text-[var(--text-muted)] mb-2">Question #{activeMoment + 1}</p>
                    <p className="text-body text-brand-purple-light">{moments[activeMoment].question}</p>
                  </div>

                  <ShadowReplayCard
                    question={moments[activeMoment].question}
                    answer={moments[activeMoment].answer}
                    innerMonologue={moments[activeMoment].inner_monologue}
                    scores={moments[activeMoment].scores}
                    flag={moments[activeMoment].flag}
                    isActive={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-subtle)]">
              <Button
                variant="ghost"
                onClick={() => setActiveMoment(Math.max(0, activeMoment - 1))}
                disabled={activeMoment === 0}
              >
                ← Previous
              </Button>

              {activeMoment === moments.length - 1 ? (
                <Button size="lg" onClick={() => navigate(`/report/${sessionId}`)}>
                  View Full Report <ArrowRight size={18} />
                </Button>
              ) : (
                <Button onClick={() => setActiveMoment(activeMoment + 1)}>
                  Next →
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
