import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  className?: string;
}

export function TypewriterText({ text, className = '' }: TypewriterTextProps) {
  // Color-code special sections
  const renderChar = (char: string, i: number) => {
    return (
      <motion.span
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.018, duration: 0.01 }}
      >
        {char}
      </motion.span>
    );
  };

  return (
    <div
      className={`font-mono text-sm leading-relaxed text-brand-teal ${className}`}
    >
      {text.split('').map((char, i) => renderChar(char, i))}
    </div>
  );
}

interface ShadowReplayCardProps {
  question: string;
  answer: string;
  innerMonologue: string;
  scores: {
    star: number;
    technical: number;
    confidence: number;
    clarity: number;
  };
  flag: string | null;
  isActive: boolean;
}

export function ShadowReplayCard({
  question,
  answer,
  innerMonologue,
  scores,
  flag,
  isActive,
}: ShadowReplayCardProps) {
  const avgScore = (scores.star + scores.technical + scores.confidence + scores.clarity) / 4;
  const scoreColor = avgScore >= 7 ? '#14B8A6' : avgScore >= 4 ? '#F59E0B' : '#F43F5E';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Candidate Answer */}
      <div className="bg-surface rounded-xl p-5 border border-[var(--border-subtle)]">
        <p className="text-label text-[var(--text-muted)] mb-2">Your Answer</p>
        <p className="text-sm text-[var(--text-primary)] leading-relaxed">{answer}</p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-teal/40 to-transparent" />
        <span className="text-label text-brand-teal flex items-center gap-1.5">
          [ Interviewer's Thoughts — Hidden Until Now ]
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-teal/40 to-transparent" />
      </div>

      {/* Inner Monologue */}
      <div className="bg-surface rounded-xl p-5 border border-brand-teal/20">
        {isActive ? (
          <TypewriterText text={innerMonologue} />
        ) : (
          <p className="font-mono text-sm leading-relaxed text-brand-teal">{innerMonologue}</p>
        )}
      </div>

      {/* Flags & Scores */}
      <div className="flex flex-wrap items-center gap-2">
        {flag && (
          <span
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${scoreColor}15`,
              color: scoreColor,
              border: `1px solid ${scoreColor}30`,
            }}
          >
            {flag.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
        )}
        <span className="px-2 py-1 rounded text-xs font-mono text-[var(--text-muted)]">
          STAR: {scores.star.toFixed(1)} | Tech: {scores.technical.toFixed(1)} | Conf: {scores.confidence.toFixed(1)} | Clarity: {scores.clarity.toFixed(1)}
        </span>
      </div>
    </motion.div>
  );
}
