import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: string;
  onClick?: () => void;
}

export function Card({ children, className, hover = true, glow, onClick }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={cn(
        'bg-surface rounded-xl border border-[var(--border-subtle)]',
        'shadow-[var(--shadow-card)] transition-all duration-300',
        hover && 'hover:border-[var(--border-default)] cursor-pointer',
        className,
      )}
      style={glow ? { boxShadow: `var(--shadow-card), ${glow}` } : undefined}
    >
      {children}
    </motion.div>
  );
}
