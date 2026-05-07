import { motion } from 'framer-motion';

interface FillerWordChartProps {
  data: { word: string; count: number }[];
}

export function FillerWordChart({ data }: FillerWordChartProps) {
  if (!data.length) {
    return <p className="text-sm text-[var(--text-muted)]">No filler words detected</p>;
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="space-y-3">
      {data.sort((a, b) => b.count - a.count).map((item, i) => (
        <div key={item.word} className="flex items-center gap-3">
          <span className="w-20 text-sm text-[var(--text-secondary)] text-right font-mono">{item.word}</span>
          <div className="flex-1 h-6 bg-elevated rounded-lg overflow-hidden">
            <motion.div
              className="h-full rounded-lg bg-brand-amber/60"
              initial={{ width: 0 }}
              animate={{ width: `${(item.count / maxCount) * 100}%` }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className="w-8 text-sm text-brand-amber font-mono">{item.count}</span>
        </div>
      ))}
    </div>
  );
}
