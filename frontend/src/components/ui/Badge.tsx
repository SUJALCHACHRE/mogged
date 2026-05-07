import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  variant?: 'filled' | 'outline';
  className?: string;
}

export function Badge({ children, color = '#7C3AED', variant = 'outline', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        variant === 'outline'
          ? 'border'
          : '',
        className,
      )}
      style={{
        color: color,
        borderColor: variant === 'outline' ? `${color}33` : 'transparent',
        backgroundColor: variant === 'filled' ? `${color}20` : `${color}10`,
      }}
    >
      {children}
    </span>
  );
}
