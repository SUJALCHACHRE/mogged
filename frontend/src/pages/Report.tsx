import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Download, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';
import { ScoreRing } from '../components/report/ScoreRing';
import { FillerWordChart } from '../components/report/FillerWordChart';
import { ConfidenceCurve } from '../components/report/ConfidenceCurve';
import { getReport, getShadowTranscript } from '../lib/api';
import { getPersonaById, getScoreColor } from '../lib/utils';
import type { SessionReport, ShadowTranscript } from '../types';

export default function Report() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const { data: report, isLoading } = useQuery<SessionReport>({
    queryKey: ['report', sessionId],
    queryFn: () => getReport(sessionId || ''),
    enabled: !!sessionId,
  });

  const { data: shadow } = useQuery<ShadowTranscript>({
    queryKey: ['shadow', sessionId],
    queryFn: () => getShadowTranscript(sessionId || ''),
    enabled: !!sessionId,
  });

  const confidenceData = shadow?.moments.map(m => m.scores.confidence) || [];
  const persona = getPersonaById(report?.session?.persona_id || '');
  const nextPersona = getPersonaById(report?.next_recommended_persona || '');

  // Aggregate filler words from shadow data
  const fillerAgg: Record<string, number> = {};
  shadow?.moments.forEach(m => {
    m.filler_words?.words?.forEach((w: any) => {
      fillerAgg[w.word] = (fillerAgg[w.word] || 0) + w.count;
    });
  });
  const fillerData = Object.entries(fillerAgg).map(([word, count]) => ({ word, count }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <Loader text="Loading report..." />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <Card className="p-8 text-center" hover={false}>
          <p className="text-[var(--text-primary)] mb-4">Report is still being generated...</p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </Card>
      </div>
    );
  }

  const priorityColor = { critical: '#F43F5E', important: '#F59E0B', suggested: '#14B8A6' };

  return (
    <PageWrapper className="min-h-screen bg-void">
      <Navbar />
      <main className="md:ml-64 p-6 lg:p-10 pb-24 md:pb-10 max-w-5xl">
        {/* Hero Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <ScoreRing value={report.overall_score} size={180} strokeWidth={12} label="Overall Score" />
          <p className="text-body text-[var(--text-secondary)] mt-4">
            You outperformed <span className="text-brand-teal font-medium">{Math.round(report.session?.percentile_rank || 50)}%</span> of candidates for{' '}
            <span className="text-[var(--text-primary)] font-medium">{report.session?.target_role}</span>
          </p>
        </motion.div>

        {/* Sub Scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Technical', value: report.technical_score },
            { label: 'Communication', value: report.communication_score },
            { label: 'Confidence', value: report.confidence_score },
            { label: 'STAR Structure', value: report.star_compliance_score },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <ScoreRing value={s.value} size={100} strokeWidth={8} label={s.label} color={getScoreColor(s.value)} />
            </motion.div>
          ))}
        </div>

        {/* Strengths & Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card className="p-6" hover={false}>
              <h3 className="text-heading text-brand-teal flex items-center gap-2 mb-4">
                <CheckCircle size={18} /> What You Did Well
              </h3>
              <div className="space-y-3">
                {report.top_strengths?.map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-brand-teal mt-0.5">›</span>
                    <p className="text-sm text-[var(--text-secondary)]">{s}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card className="p-6" hover={false}>
              <h3 className="text-heading text-brand-coral flex items-center gap-2 mb-4">
                <XCircle size={18} /> Where You Lost Points
              </h3>
              <div className="space-y-3">
                {report.critical_gaps?.map((g, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-brand-coral mt-0.5">›</span>
                    <p className="text-sm text-[var(--text-secondary)]">{g}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Vocal Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6" hover={false}>
            <h3 className="text-heading text-[var(--text-primary)] mb-4">Filler Words</h3>
            <FillerWordChart data={fillerData} />
            <p className="text-xs text-[var(--text-muted)] mt-3">Total: {report.total_filler_words} filler words detected</p>
          </Card>

          <Card className="p-6" hover={false}>
            <h3 className="text-heading text-[var(--text-primary)] mb-4">Confidence Curve</h3>
            <ConfidenceCurve data={confidenceData} />
            <p className="text-xs text-[var(--text-muted)] mt-3">
              Avg pace: {report.avg_speaking_pace_wpm} WPM · Longest silence: {((report.longest_silence_ms || 0) / 1000).toFixed(1)}s
            </p>
          </Card>
        </div>

        {/* Improvement Actions */}
        <div className="mb-12">
          <h3 className="text-heading text-[var(--text-primary)] mb-4">Improvement Actions</h3>
          <div className="space-y-3">
            {report.improvement_actions?.map((action, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.1 }}>
                <Card className="p-5" hover={false}>
                  <div className="flex items-start gap-3">
                    <Badge
                      color={(priorityColor as any)[action.priority] || '#8B8AA8'}
                      variant="filled"
                      className="shrink-0 mt-0.5"
                    >
                      {action.priority}
                    </Badge>
                    <div>
                      <p className="text-sm text-[var(--text-primary)] mb-1">{action.action}</p>
                      <p className="text-xs text-[var(--text-muted)]">{action.exercise}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Next Challenge */}
        {nextPersona && (
          <Card className="p-8 text-center border-brand-purple/20" hover={false}>
            <h3 className="text-heading text-[var(--text-primary)] mb-2">Ready to go harder?</h3>
            <p className="text-body text-[var(--text-secondary)] mb-4">
              Try facing <span className="text-brand-purple font-medium">{nextPersona.name}</span> next.
            </p>
            <Button onClick={() => navigate('/setup')}>
              Face {nextPersona.name} <ArrowRight size={18} />
            </Button>
          </Card>
        )}

        {/* Export */}
        <div className="mt-8 text-center">
          <Button
            variant="secondary"
            onClick={() => window.print()}
          >
            <Download size={16} /> Download Report (PDF)
          </Button>
        </div>
      </main>
    </PageWrapper>
  );
}
