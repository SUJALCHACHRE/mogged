import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, type, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-label text-[var(--text-secondary)]">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          className={cn(
            'w-full bg-[rgba(246,239,227,0.045)] border border-[var(--border-subtle)] rounded-xl px-4 py-3.5 text-[var(--text-primary)] text-sm',
            'placeholder:text-[var(--text-muted)] transition-all duration-200',
            'focus:outline-none focus:border-brand-purple focus:shadow-[0_0_0_4px_rgba(201,164,106,0.16)]',
            'hover:border-[var(--border-default)]',
            error && 'border-brand-coral focus:border-brand-coral focus:shadow-[0_0_0_4px_rgba(165,79,71,0.15)]',
            icon ? 'pl-10' : undefined,
            isPassword ? 'pr-10' : undefined,
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-brand-coral text-xs"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
