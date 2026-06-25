import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { askReportQuestion } from '../../lib/api';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ReportChatbotProps {
  sessionId: string;
}

export function ReportChatbot({ sessionId }: ReportChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Interview Coach. I've reviewed your report. Ask me anything about your performance, weak points, or how to improve!",
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const { mutate, isPending } = useMutation({
    mutationFn: (newMessages: Message[]) => askReportQuestion(sessionId, newMessages),
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    },
    onError: () => {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again." }]);
    }
  });

  const handleSend = () => {
    if (!input.trim() || isPending) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    mutate(newMessages);
  };

  return (
    <Card className="flex flex-col h-full border border-brand-purple/20 shadow-[0_0_30px_rgba(168,85,247,0.05)] overflow-hidden" hover={false}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[var(--border-subtle)] bg-[var(--surface-hover)]">
        <div className="p-2 rounded-lg bg-brand-purple/10 text-brand-purple">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">AI Coach</h3>
          <p className="text-xs text-[var(--text-muted)]">Ask about your report</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[var(--border-default)] scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-brand-teal/20 text-brand-teal' : 'bg-brand-purple/20 text-brand-purple'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-3 ${
                msg.role === 'user' 
                  ? 'bg-brand-teal/10 text-[var(--text-primary)] rounded-tr-sm border border-brand-teal/20' 
                  : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] rounded-tl-sm border border-[var(--border-subtle)]'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm prose-invert max-w-none text-sm
                    prose-p:leading-relaxed prose-p:mb-2 last:prose-p:mb-0
                    prose-ul:my-2 prose-li:my-0.5
                    prose-strong:text-[var(--text-primary)] prose-strong:font-semibold">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 flex-row"
            >
              <div className="shrink-0 w-8 h-8 rounded-full bg-brand-purple/20 text-brand-purple flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-[var(--surface-hover)] text-[var(--text-secondary)] rounded-2xl rounded-tl-sm border border-[var(--border-subtle)] p-4 flex items-center gap-1">
                <motion.div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                <motion.div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                <motion.div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--surface-hover)]">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about your performance..."
            className="w-full bg-surface border border-[var(--border-subtle)] rounded-xl py-3 px-4 pr-12 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-brand-purple/50 resize-none overflow-hidden min-h-[46px] max-h-[120px] transition-colors"
            rows={1}
            disabled={isPending}
            style={{
              height: 'auto',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isPending}
            className="absolute right-2 bottom-1.5 p-2 rounded-lg text-[var(--text-muted)] hover:text-brand-purple hover:bg-brand-purple/10 disabled:opacity-50 disabled:hover:text-[var(--text-muted)] disabled:hover:bg-transparent transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </Card>
  );
}
