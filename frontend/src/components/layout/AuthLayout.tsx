import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const quotes = [
  'Qualified candidates lose when their signal is buried.',
  'The average interviewer decides early, then looks for proof.',
  'Mirror Mode shows what those first minutes are actually saying.',
  "Your competition is practicing. You can practice with the room's notes.",
];

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="premium-shell grain flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-[var(--border-subtle)] p-12 lg:flex">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(201,164,106,0.12),transparent_44%,rgba(47,125,104,0.08))]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-purple/35 bg-[rgba(246,239,227,0.06)]">
              <Zap size={16} className="text-brand-purple-light" />
            </div>
            <span className="text-sm font-bold uppercase tracking-[0.18em]">Mirror Mode</span>
          </div>
        </div>

        <div className="relative z-10 flex flex-1 items-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="max-w-lg text-4xl font-semibold leading-tight text-[var(--text-primary)]"
            >
              {quotes[quoteIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-[var(--text-muted)]">A sharper room for sharper answers.</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        {children}
      </div>
    </div>
  );
}
