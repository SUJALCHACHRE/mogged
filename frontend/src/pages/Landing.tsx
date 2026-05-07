import { useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileSearch,
  Gauge,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PageWrapper } from '../components/layout/PageWrapper';

const proof = [
  { value: '87', label: 'signal points tracked' },
  { value: '4.8x', label: 'faster feedback loops' },
  { value: '20m', label: 'complete interview replay' },
];

const workflow = [
  {
    icon: FileSearch,
    title: 'Resume pressure map',
    text: 'Mogged reads your resume like an interviewer and marks claims that need stronger evidence.',
  },
  {
    icon: MessageSquareText,
    title: 'Adaptive interview room',
    text: 'Questions shift as you answer, with pace, clarity, filler words, and confidence scored live.',
  },
  {
    icon: Eye,
    title: 'Shadow transcript',
    text: 'See the hidden evaluation layer: what felt convincing, what sounded vague, and what gets probed next.',
  },
];

const features = [
  { icon: Brain, title: 'Persona engines', text: 'Practice against calm, skeptical, senior, or pressure-heavy interviewers.' },
  { icon: Gauge, title: 'Live delivery metrics', text: 'Track pacing, latency, filler spikes, answer shape, and confidence drift.' },
  { icon: Target, title: 'Rubric scoring', text: 'Separate technical strength, clarity, ownership, and executive presence.' },
  { icon: ShieldCheck, title: 'Actionable report', text: 'Leave with exact drills and answer rewrites instead of generic advice.' },
];

function HeroVisual() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.panel-rise',
        { y: 34, opacity: 0, rotateX: -8 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1, stagger: 0.13, ease: 'power3.out', delay: 0.45 },
      );
      gsap.to('.scan-line', {
        xPercent: 150,
        duration: 2.8,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true,
      });
      gsap.to('.metric-fill', {
        width: (_i, el) => el.getAttribute('data-width') || '72%',
        duration: 1.6,
        ease: 'power3.out',
        stagger: 0.18,
        delay: 0.9,
      });
      gsap.to('.pulse-dot', {
        scale: 1.7,
        opacity: 0.35,
        duration: 1.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.24,
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative mx-auto w-full max-w-[560px] pb-10 perspective-[1200px]">
      <div className="panel-rise relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[rgba(246,239,227,0.07)] p-4 shadow-[var(--shadow-lift)]">
        <div className="scan-line pointer-events-none absolute inset-y-0 left-[-60%] w-1/2 bg-gradient-to-r from-transparent via-[rgba(234,214,166,0.2)] to-transparent" />
        <div className="mb-4 flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div>
            <p className="text-label text-[var(--text-muted)]">Live interview board</p>
            <h3 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">Senior Product Engineer</h3>
          </div>
          <div className="rounded-full border border-[rgba(234,214,166,0.42)] px-3 py-1 text-sm font-semibold text-[var(--brand-gold-soft)]">
            82/100
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_0.8fr]">
          <div className="panel-rise rounded-xl bg-[var(--bg-cream)] p-4 text-[var(--text-dark)]">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-emerald" />
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-emerald">Candidate answer</p>
            </div>
            <p className="text-sm leading-6">
              I reduced latency by redesigning the queue path, then aligned the rollout with support and data teams.
            </p>
          </div>

          <div className="panel-rise rounded-xl border border-[rgba(234,214,166,0.18)] bg-[#11100d] p-4">
            <p className="text-label text-[var(--brand-gold-soft)]">Shadow read</p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Strong ownership signal. Probe for exact tradeoff, failure mode, and who approved the rollout.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ['Clarity', '86%'],
            ['Evidence', '74%'],
            ['Composure', '91%'],
          ].map(([label, value]) => (
            <div key={label} className="panel-rise rounded-xl border border-[var(--border-subtle)] bg-black/20 p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">{label}</span>
                <span className="text-[var(--brand-gold-soft)]">{value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                <div className="metric-fill h-full w-0 rounded-full bg-[var(--brand-gold)]" data-width={value} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-rise absolute -bottom-4 left-4 right-4 rounded-2xl border border-[var(--border-subtle)] bg-[#0d0b08]/95 p-4 shadow-[var(--shadow-card)] backdrop-blur-xl sm:left-10 sm:right-10">
        <div className="flex items-start gap-3">
          <div className="relative mt-1">
            <span className="pulse-dot absolute inset-0 h-3 w-3 rounded-full bg-brand-emerald" />
            <span className="relative block h-3 w-3 rounded-full bg-brand-emerald" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Next probe generated</p>
            <p className="mt-1 text-small text-[var(--text-secondary)]">
              Ask for a concrete metric before accepting the impact claim.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo('.hero-kicker', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
        .fromTo('.hero-title span', { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, stagger: 0.08 }, '-=0.25')
        .fromTo('.hero-copy', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75 }, '-=0.35')
        .fromTo('.hero-actions', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65 }, '-=0.25')
        .fromTo('.proof-item', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.09 }, '-=0.15');

      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 34, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: undefined,
          },
        );
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <PageWrapper className="premium-shell grain min-h-screen">
      <div ref={pageRef} className="relative z-10">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(234,214,166,0.35)] bg-[rgba(246,239,227,0.06)]">
              <Sparkles size={17} className="text-[var(--brand-gold-soft)]" />
            </span>
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-primary)]">Mogged</span>
          </button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/auth')}>
            Enter App <ArrowRight size={15} />
          </Button>
        </header>

        <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-5 pb-28 pt-8 sm:px-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <div className="hero-kicker mb-7 inline-flex items-center gap-3 rounded-full border border-[var(--border-default)] bg-[rgba(246,239,227,0.055)] px-4 py-2 text-label text-[var(--brand-gold-soft)]">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-emerald" />
              Interview intelligence suite
            </div>

            <h1 className="hero-title text-hero max-w-3xl text-[var(--text-primary)]">
              <span className="block">Practice like</span>
              <span className="block gold-text">the room is</span>
              <span className="block">finally honest.</span>
            </h1>

            <p className="hero-copy mt-8 max-w-xl text-lg leading-8 text-[var(--text-secondary)]">
              Mogged turns interview prep into a premium analysis room: adaptive questions, hidden interviewer notes,
              delivery metrics, and a replay that tells you exactly what to sharpen.
            </p>

            <div className="hero-actions mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => navigate('/auth')} className="sm:min-w-[220px]">
                Start Interview <ArrowRight size={18} />
              </Button>
              <a
                href="#system"
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              >
                View system <ChevronDown size={17} />
              </a>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 gap-3">
              {proof.map((item) => (
                <div key={item.label} className="proof-item rounded-xl border border-[var(--border-subtle)] bg-[rgba(246,239,227,0.035)] p-4">
                  <p className="text-2xl font-semibold text-[var(--brand-gold-soft)]">{item.value}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <HeroVisual />
        </section>

        <section id="system" className="border-y border-[var(--border-subtle)] bg-[rgba(246,239,227,0.025)] px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-2xl">
              <p className="text-label text-[var(--brand-gold-soft)]">How it works</p>
              <h2 className="mt-4 text-title text-[var(--text-primary)]">A cleaner way to prepare under pressure.</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {workflow.map((item, index) => (
                <article key={item.title} className="reveal rounded-2xl border border-[var(--border-subtle)] bg-[rgba(246,239,227,0.045)] p-6">
                  <div className="mb-8 flex items-center justify-between">
                    <item.icon size={24} className="text-[var(--brand-gold-soft)]" />
                    <span className="text-sm font-semibold text-[var(--text-muted)]">0{index + 1}</span>
                  </div>
                  <h3 className="text-heading text-[var(--text-primary)]">{item.title}</h3>
                  <p className="mt-4 text-body text-[var(--text-secondary)]">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-24 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="sticky top-8">
              <p className="text-label text-[var(--brand-gold-soft)]">Inside the suite</p>
              <h2 className="mt-4 text-title text-[var(--text-primary)]">Less noise. More signal.</h2>
              <p className="mt-6 text-body text-[var(--text-secondary)]">
                The new interface is built around reading, scanning, and repeated practice. Premium, restrained, and direct.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((item) => (
                <article key={item.title} className="reveal rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)]">
                  <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(201,164,106,0.12)] text-[var(--brand-gold-soft)]">
                    <item.icon size={22} />
                  </div>
                  <h3 className="text-heading text-[var(--text-primary)]">{item.title}</h3>
                  <p className="mt-3 text-small text-[var(--text-secondary)]">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[var(--bg-cream)] p-8 text-[var(--text-dark)] shadow-[var(--shadow-lift)] md:p-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-label text-brand-emerald">Ready room</p>
                <h2 className="mt-4 max-w-3xl text-title text-[var(--text-dark)]">Run the interview. Read the room. Fix the answer.</h2>
              </div>
              <Button size="lg" onClick={() => navigate('/auth')} className="bg-[var(--text-dark)] text-[var(--bg-cream)] hover:bg-brand-ink">
                Launch Mogged <ArrowRight size={18} />
              </Button>
            </div>
            <div className="mt-10 grid gap-3 border-t border-black/10 pt-6 sm:grid-cols-3">
              {['Adaptive difficulty', 'Shadow transcript', 'Performance report'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 size={17} className="text-brand-emerald" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
