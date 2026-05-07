import { motion } from 'framer-motion';

interface StressIndicatorProps {
  level: number; // 0-100
}

export function StressIndicator({ level }: StressIndicatorProps) {
  const color = level > 66 ? '#F43F5E' : level > 33 ? '#F59E0B' : '#14B8A6';
  const label = level > 66 ? 'High' : level > 33 ? 'Medium' : 'Low';

  return (
    <div className="flex items-center gap-2">
      <span className="text-label text-[var(--text-muted)]">Pressure</span>
      <div className="w-32 h-2 bg-elevated rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, level)}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </div>
      <span className="text-xs font-medium" style={{ color }}>{label}</span>
    </div>
  );
}
