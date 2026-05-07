import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock, Eye, FileText, Filter, Plus } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { getHistory } from '../lib/api';
import { formatDate, formatDuration, getPersonaById } from '../lib/utils';

type FilterType = 'all' | 'completed' | 'active';

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['history', user?.id],
    queryFn: () => getHistory(user?.id || ''),
    enabled: !!user?.id,
    retry: 1,
  });

  const allSessions = data?.sessions || [];
  const sessions = allSessions.filter((session: any) => {
    if (filter === 'completed') return session.status === 'completed';
    if (filter === 'active') return session.status === 'active';
    return true;
  });

  return (
    <PageWrapper className="premium-shell grain min-h-screen">
      <Navbar />
      <main className="relative z-10 pb-24 md:ml-64 md:pb-10">
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
          <motion.header
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-7 overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[rgba(246,239,227,0.055)] p-6 shadow-[var(--shadow-lift)] md:p-8"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[rgba(246,239,227,0.05)] px-4 py-2 text-label text-[var(--brand-gold-soft)]">
                  <Filter size={14} />
                  Interview archive
                </div>
                <h1 className="text-title text-[var(--text-primary)]">History</h1>
                <p className="mt-4 max-w-2xl text-body text-[var(--text-secondary)]">
                  Review every room, score, report, and shadow transcript from your practice runs.
                </p>
              </div>
              <Button size="lg" onClick={() => navigate('/setup')}>
                New Interview <Plus size={18} />
              </Button>
            </div>
          </motion.header>

          <div className="mb-6 flex flex-wrap gap-2">
            {(['all', 'completed', 'active'] as FilterType[]).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  filter === item
                    ? 'border-[var(--border-strong)] bg-[var(--bg-cream)] text-[var(--text-dark)]'
                    : 'border-[var(--border-subtle)] bg-[rgba(246,239,227,0.045)] text-[var(--text-muted)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]'
                }`}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center rounded-3xl border border-[var(--border-subtle)] bg-[rgba(246,239,227,0.04)] py-20">
              <Loader text="Loading history..." />
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--border-default)] bg-[rgba(246,239,227,0.04)] p-12 text-center shadow-[var(--shadow-card)]">
              <Clock size={30} className="mx-auto mb-4 text-[var(--brand-gold-soft)]" />
              <p className="text-xl font-semibold text-[var(--text-primary)]">No interviews found</p>
              <p className="mx-auto mt-3 max-w-md text-small text-[var(--text-muted)]">
                Start your first interview and this archive will turn into your performance timeline.
              </p>
              <Button className="mt-6" onClick={() => navigate('/setup')}>
                Start Interview <ArrowRight size={17} />
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {sessions.map((session: any, index: number) => {
                const persona = getPersonaById(session.persona_id);
                const score = session.overall_score != null ? Math.round(session.overall_score) : null;

                return (
                  <motion.article
                    key={session.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="grid gap-5 rounded-3xl border border-[var(--border-subtle)] bg-[rgba(246,239,227,0.045)] p-5 shadow-[var(--shadow-card)] transition hover:border-[var(--border-default)] lg:grid-cols-[auto_1fr_auto] lg:items-center"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(201,164,106,0.12)] text-lg font-bold text-[var(--brand-gold-soft)]">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <h2 className="truncate text-xl font-semibold text-[var(--text-primary)]">
                          {session.target_role || 'Interview session'}
                        </h2>
                        <span className="rounded-full border border-[var(--border-subtle)] bg-black/10 px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
                          {session.status || 'draft'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-small text-[var(--text-muted)]">
                        <span>{persona?.name || 'Unknown persona'}</span>
                        <span>{formatDate(session.created_at)}</span>
                        {session.duration_seconds && (
                          <span className="inline-flex items-center gap-1">
                            <Clock size={13} />
                            {formatDuration(session.duration_seconds)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <span className="mr-1 rounded-full border border-[var(--border-default)] px-4 py-2 text-sm font-semibold text-[var(--brand-gold-soft)]">
                        {score ?? '--'}
                      </span>
                      {session.status === 'completed' ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => navigate(`/shadow/${session.id}`)}>
                            <Eye size={14} /> Shadow
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => navigate(`/report/${session.id}`)}>
                            <FileText size={14} /> Report
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" onClick={() => navigate(`/interview/${session.id}`)}>
                          Resume
                        </Button>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </PageWrapper>
  );
}
