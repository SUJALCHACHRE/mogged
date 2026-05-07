import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Clock,
  FileText,
  LineChart,
  Plus,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { getHistory } from '../lib/api';
import { formatDate, getPersonaById } from '../lib/utils';

const statColors = ['#EAD6A6', '#2F7D68', '#B87B55', '#A54F47'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['history', user?.id],
    queryFn: () => getHistory(user?.id || ''),
    enabled: !!user?.id,
    retry: 1,
  });

  const sessions = historyData?.sessions || [];
  const recentSessions = sessions.slice(0, 5);
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const bestSession = sessions.reduce(
    (max: any, session: any) => (!max || (session.overall_score || 0) > (max.overall_score || 0) ? session : max),
    null,
  );

  const stats = [
    { label: 'Interviews', value: user?.total_interviews || sessions.length || 0, icon: BarChart3 },
    { label: 'Avg score', value: `${Math.round(user?.avg_score || 0)}/100`, icon: LineChart },
    { label: 'Best room', value: bestSession ? getPersonaById(bestSession.persona_id)?.name || 'Review' : 'Not yet', icon: Trophy },
    { label: 'Percentile', value: sessions.length > 0 ? `${Math.round(sessions[0]?.percentile_rank || 50)}%` : '0%', icon: Users },
  ];

  return (
    <PageWrapper className="premium-shell grain min-h-screen">
      <Navbar />
      <main className="relative z-10 pb-24 md:ml-64 md:pb-10">
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[rgba(246,239,227,0.055)] shadow-[var(--shadow-lift)]"
          >
            <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[rgba(246,239,227,0.05)] px-4 py-2 text-label text-[var(--brand-gold-soft)]">
                  <Sparkles size={14} />
                  Practice command center
                </div>
                <h1 className="max-w-3xl text-title text-[var(--text-primary)]">
                  Welcome back, <span className="gold-text">{firstName}</span>.
                </h1>
                <p className="mt-5 max-w-2xl text-body text-[var(--text-secondary)]">
                  Pick up where you left off, start a sharper interview room, or review the signals from your latest session.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" onClick={() => navigate('/setup')}>
                    New Interview <Plus size={18} />
                  </Button>
                  <Button size="lg" variant="secondary" onClick={() => navigate('/history')}>
                    View History <ArrowRight size={18} />
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[#0d0b08]/80 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-label text-[var(--text-muted)]">Today</p>
                    <p className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{dateLabel}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(201,164,106,0.12)] text-[var(--brand-gold-soft)]">
                    <CalendarDays size={22} />
                  </div>
                </div>
                <div className="hairline mb-5" />
                <div className="space-y-4">
                  {[
                    ['Resume evidence', 'Map claims before the interview'],
                    ['Delivery signal', 'Watch pace, filler words, and latency'],
                    ['Shadow read', 'Review what the interviewer inferred'],
                  ].map(([title, text]) => (
                    <div key={title} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-[var(--brand-emerald)]" />
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
                        <p className="text-small text-[var(--text-muted)]">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.article
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.45 }}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(246,239,227,0.045)] p-5 shadow-[var(--shadow-card)]"
              >
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-label text-[var(--text-muted)]">{stat.label}</p>
                  <stat.icon size={18} style={{ color: statColors[index] }} />
                </div>
                <p className="truncate text-2xl font-semibold text-[var(--text-primary)]">{stat.value}</p>
              </motion.article>
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <motion.article
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.5 }}
              className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)]"
            >
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-label text-[var(--brand-gold-soft)]">Ready room</p>
                  <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">Start a focused practice run.</h2>
                </div>
                <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(201,164,106,0.12)] text-[var(--brand-gold-soft)] sm:flex">
                  <FileText size={23} />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {['Upload resume', 'Choose persona', 'Read the report'].map((item, index) => (
                  <div key={item} className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(246,239,227,0.035)] p-4">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{item}</p>
                    <p className="mt-3 text-2xl font-semibold text-[var(--text-muted)]">0{index + 1}</p>
                  </div>
                ))}
              </div>
              <Button size="lg" className="mt-7 w-full sm:w-auto" onClick={() => navigate('/setup')}>
                Configure Interview <ArrowRight size={18} />
              </Button>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.5 }}
              className="rounded-3xl border border-[var(--border-subtle)] bg-[rgba(246,239,227,0.04)] p-6 shadow-[var(--shadow-card)]"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-label text-[var(--brand-gold-soft)]">Recent sessions</p>
                  <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">Latest room reads</h2>
                </div>
                <Button size="sm" variant="secondary" onClick={() => navigate('/history')}>
                  All
                </Button>
              </div>

              {isLoading ? (
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-black/10 p-8 text-center text-[var(--text-muted)]">
                  Loading recent sessions...
                </div>
              ) : recentSessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-black/10 p-8 text-center">
                  <Clock size={24} className="mx-auto mb-3 text-[var(--brand-gold-soft)]" />
                  <p className="text-base font-semibold text-[var(--text-primary)]">No interviews yet</p>
                  <p className="mt-2 text-small text-[var(--text-muted)]">Your session reports will appear here after your first run.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSessions.map((session: any, index: number) => {
                    const persona = getPersonaById(session.persona_id);
                    return (
                      <button
                        key={session.id}
                        onClick={() => navigate(`/report/${session.id}`)}
                        className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[#0d0b08]/70 p-4 text-left transition hover:border-[var(--border-default)] hover:bg-[rgba(246,239,227,0.055)]"
                      >
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(201,164,106,0.12)] text-sm font-bold text-[var(--brand-gold-soft)]">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">
                            {session.target_role || 'Interview session'}
                          </span>
                          <span className="mt-1 block truncate text-xs text-[var(--text-muted)]">
                            {persona?.name || 'Unknown persona'} · {formatDate(session.created_at)}
                          </span>
                        </span>
                        <span className="rounded-full border border-[var(--border-default)] px-3 py-1 text-sm font-semibold text-[var(--brand-gold-soft)]">
                          {session.overall_score ? Math.round(session.overall_score) : '--'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.article>
          </section>
        </div>
      </main>
    </PageWrapper>
  );
}
