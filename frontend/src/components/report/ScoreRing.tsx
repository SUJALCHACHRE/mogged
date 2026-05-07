import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { getScoreColor } from '../../lib/utils';

interface ScoreRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
}

export function ScoreRing({ value, max = 100, size = 160, strokeWidth = 10, label, color: colorProp }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const color = colorProp || getScoreColor(value);

  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.round(v));
  const offset = useTransform(mv, (v) => circumference - (v / max) * circumference);

  useEffect(() => {
    const c = animate(mv, value, { duration: 1.8, ease: 'easeOut' });
    return c.stop;
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(124,58,237,0.08)" strokeWidth={strokeWidth} />
          <motion.circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} style={{ strokeDashoffset: offset }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-[var(--text-primary)]">
            <motion.span>{display}</motion.span>
          </span>
          {max === 100 && <span className="text-xs text-[var(--text-muted)]">/ 100</span>}
        </div>
      </div>
      {label && <span className="text-sm text-[var(--text-secondary)] font-medium">{label}</span>}
    </div>
  );
}
