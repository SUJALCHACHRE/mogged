import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showValue?: boolean;
  suffix?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = '#7C3AED',
  label,
  showValue = true,
  suffix = '',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const motionValue = useMotionValue(0);
  const displayValue = useTransform(motionValue, (v) => Math.round(v));
  const strokeDashoffset = useTransform(
    motionValue,
    (v) => circumference - (v / max) * circumference
  );

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.5,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [value, motionValue]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(124, 58, 237, 0.1)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-semibold text-[var(--text-primary)]">
              <motion.span>{displayValue}</motion.span>
              {suffix}
            </span>
          </div>
        )}
      </div>
      {label && (
        <span className="text-xs text-[var(--text-secondary)] font-medium">{label}</span>
      )}
    </div>
  );
}
