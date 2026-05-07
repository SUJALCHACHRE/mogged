import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { getDifficultyColor } from '../../lib/utils';
import type { Persona } from '../../types';

interface PersonaCardProps {
  persona: Persona;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

export function PersonaCard({ persona, isSelected, onClick, index }: PersonaCardProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onClick={onClick}
      className={`relative h-full rounded-2xl border p-5 text-left shadow-[var(--shadow-card)] transition-all duration-300 ${
        isSelected
          ? 'border-[var(--border-strong)] bg-[rgba(201,164,106,0.12)]'
          : 'border-[var(--border-subtle)] bg-[rgba(246,239,227,0.04)] hover:border-[var(--border-default)] hover:bg-[rgba(246,239,227,0.065)]'
      }`}
    >
      {isSelected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-cream)] text-[var(--text-dark)]"
        >
          <Check size={15} />
        </motion.span>
      )}

      <div className="mb-5 flex items-start gap-3 pr-8">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(201,164,106,0.12)] text-lg font-bold text-[var(--brand-gold-soft)]">
          {persona.name.charAt(4)}
        </div>
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">{persona.name}</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{persona.companyType}</p>
        </div>
      </div>

      <Badge color={getDifficultyColor(persona.difficulty)} variant="filled" className="mb-4">
        {persona.difficulty}
      </Badge>

      <p className="mb-5 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
        {persona.description}
      </p>

      <div className="space-y-2">
        {persona.traits.map((trait) => (
          <div key={trait} className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-emerald)]" />
            {trait}
          </div>
        ))}
      </div>
    </motion.button>
  );
}
