import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Zap, Clock, XCircle, Activity, Hash, Gauge, Timer, Star } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { InterviewChat } from '../components/interview/InterviewChat';
import { VoiceInput } from '../components/interview/VoiceInput';
import { StressIndicator } from '../components/interview/StressIndicator';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Button } from '../components/ui/Button';
import { useInterviewSocket } from '../hooks/useWebSocket';
import { useInterviewStore } from '../store/interviewStore';
import { getInterview, endInterview } from '../lib/api';
import { getPersonaById, formatTimer } from '../lib/utils';
import toast from 'react-hot-toast';

export default function Interview() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [ending, setEnding] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const { messages, metrics, isInterviewerTyping, isInterviewActive, startTime } = useInterviewStore();
  const { sendResponse } = useInterviewSocket(sessionId || '');

  const { data: session } = useQuery({
    queryKey: ['interview', sessionId],
    queryFn: () => getInterview(sessionId || ''),
    enabled: !!sessionId,
  });

  const persona = getPersonaById(session?.persona_id || '');

  // Timer
  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const handleEnd = async () => {
    setEnding(true);
    try {
      await endInterview(sessionId || '');
      toast.success('Interview complete!');
      navigate(`/shadow/${sessionId}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to end interview');
    } finally {
      setEnding(false);
    }
  };

  const avgScore = metrics.filler_total > 0
    ? Math.max(0, 100 - metrics.filler_total * 5 - metrics.stress_level * 0.5)
    : 75;

  return (
    <PageWrapper className="h-screen bg-void flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)] bg-surface shrink-0">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-brand-purple" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Mirror Mode</span>
          <span className="text-xs text-[var(--text-muted)] font-mono ml-2">{sessionId?.slice(0, 8)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[var(--text-muted)]" />
          <motion.span
            className="text-sm font-mono text-[var(--text-primary)]"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {formatTimer(elapsed)}
          </motion.span>
        </div>
        <div className="flex items-center gap-4">
          <StressIndicator level={metrics.stress_level} />
          <Button variant="danger" size="sm" onClick={() => setShowEndDialog(true)}>
            <XCircle size={14} /> End
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className="flex-1 lg:w-3/5 flex flex-col border-r border-[var(--border-subtle)]">
          <div className="flex-1 overflow-hidden">
            <InterviewChat
              messages={messages}
              isTyping={isInterviewerTyping}
              personaName={persona?.name || 'Interviewer'}
              personaColor={persona?.color || '#7C3AED'}
            />
          </div>
          <VoiceInput
            onSend={(text, fillerWords) => sendResponse(text, fillerWords)}
            disabled={!isInterviewActive}
          />
        </div>

        {/* Metrics Panel */}
        <div className="hidden lg:flex flex-col w-2/5 p-6 overflow-y-auto space-y-6">
          <h3 className="text-label text-[var(--text-muted)]">Live Metrics</h3>

          <div className="flex justify-center">
            <ProgressRing value={Math.round(avgScore)} size={100} label="Response Quality" color="#7C3AED" />
          </div>

          <div className="space-y-4">
            <MetricRow icon={Hash} label="Filler Words" value={metrics.filler_total.toString()} color="#F59E0B" />
            <MetricRow icon={Gauge} label="Speaking Pace" value={`${metrics.speaking_pace_wpm || '—'} WPM`}
              color={metrics.speaking_pace_wpm > 160 ? '#F43F5E' : metrics.speaking_pace_wpm > 120 ? '#14B8A6' : '#F59E0B'} />
            <MetricRow icon={Timer} label="Last Think Time" value={`${(metrics.silence_before_ms / 1000).toFixed(1)}s`} color="#A78BFA" />
            <MetricRow icon={Activity} label="Question #" value={metrics.question_count.toString()} color="#14B8A6" />
            <MetricRow icon={Star} label="Difficulty" value={`${'★'.repeat(metrics.current_difficulty)}${'☆'.repeat(5 - metrics.current_difficulty)}`} color="#F43F5E" />
          </div>
        </div>
      </div>

      {/* End Dialog */}
      {showEndDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowEndDialog(false)}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-t-2xl sm:rounded-2xl p-8 w-full max-w-md border border-[var(--border-subtle)]"
          >
            <h3 className="text-heading text-[var(--text-primary)] mb-2">End Interview?</h3>
            <p className="text-body text-[var(--text-secondary)] mb-2">
              {messages.length} messages · {formatTimer(elapsed)} elapsed
            </p>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Your Shadow Transcript and report will be generated.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowEndDialog(false)} className="flex-1">
                Continue Interview
              </Button>
              <Button onClick={handleEnd} isLoading={ending} className="flex-1">
                End & View Shadow
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </PageWrapper>
  );
}

function MetricRow({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
      <div className="flex items-center gap-2">
        <Icon size={14} style={{ color }} />
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      </div>
      <span className="text-sm font-mono text-[var(--text-primary)]">{value}</span>
    </div>
  );
}
