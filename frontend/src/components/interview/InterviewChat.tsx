import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '../../types';
import { FILLER_WORDS } from '../../lib/utils';

function HighlightedText({ text }: { text: string }) {
  const regex = new RegExp(`\\b(${FILLER_WORDS.join('|')})\\b`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        FILLER_WORDS.includes(part.toLowerCase()) ? (
          <span
            key={i}
            className="text-brand-amber bg-brand-amber/10 rounded px-0.5"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

interface InterviewChatProps {
  messages: Message[];
  isTyping: boolean;
  personaName: string;
  personaColor: string;
}

export function InterviewChat({ messages, isTyping, personaName, personaColor }: InterviewChatProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border-subtle)]">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: `${personaColor}20`, color: personaColor }}
        >
          {personaName.charAt(4)}
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{personaName}</p>
          <p className="text-xs text-[var(--text-muted)]">Interviewer</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === 'interviewer' ? -20 : 20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'interviewer'
                    ? 'bg-elevated text-[var(--text-primary)]'
                    : 'bg-brand-purple/20 text-[var(--text-primary)]'
                }`}
                style={
                  msg.role === 'interviewer'
                    ? { borderLeft: `2px solid ${personaColor}` }
                    : undefined
                }
              >
                {msg.role === 'candidate' ? (
                  <HighlightedText text={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-elevated px-4 py-3 rounded-2xl flex items-center gap-1.5" style={{ borderLeft: `2px solid ${personaColor}` }}>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-2 h-2 rounded-full bg-[var(--text-muted)]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}
