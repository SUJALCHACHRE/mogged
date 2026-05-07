import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Send, Keyboard } from 'lucide-react';
import { WaveVisualizer } from '../ui/WaveVisualizer';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { Button } from '../ui/Button';
import type { FillerWordData } from '../../types';

interface VoiceInputProps {
  onSend: (text: string, fillerWords: FillerWordData) => void;
  disabled?: boolean;
}

export function VoiceInput({ onSend, disabled }: VoiceInputProps) {
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState('');
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useVoiceInput();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleVoiceSend = () => {
    if (isListening) {
      const { transcript: text, fillerWords } = stopListening();
      if (text.trim()) {
        onSend(text.trim(), fillerWords);
        resetTranscript();
      }
    } else {
      startListening();
    }
  };

  const handleTextSend = () => {
    if (textInput.trim()) {
      onSend(textInput.trim(), { count: 0, words: [] });
      setTextInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSend();
    }
  };

  if (mode === 'text' || !isSupported) {
    return (
      <div className="border-t border-[var(--border-subtle)] px-4 py-3 bg-surface">
        <div className="flex items-end gap-3">
          {isSupported && (
            <button
              onClick={() => setMode('voice')}
              className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-2"
            >
              <Mic size={18} />
            </button>
          )}
          <textarea
            ref={inputRef}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your response..."
            rows={2}
            disabled={disabled}
            className="flex-1 bg-elevated rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:ring-1 focus:ring-brand-purple/30"
          />
          <Button
            size="sm"
            onClick={handleTextSend}
            disabled={!textInput.trim() || disabled}
            className="mb-0.5"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-[var(--border-subtle)] px-4 py-4 bg-surface">
      {/* Transcript preview */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-3 px-4 py-2 bg-elevated rounded-xl"
        >
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{transcript}</p>
        </motion.div>
      )}

      {/* Wave visualizer */}
      {isListening && (
        <div className="mb-3">
          <WaveVisualizer isActive={isListening} color="#7C3AED" height={32} />
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setMode('text')}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex items-center gap-1"
        >
          <Keyboard size={14} />
          Type instead
        </button>

        <motion.button
          onClick={handleVoiceSend}
          disabled={disabled}
          whileTap={{ scale: 0.95 }}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? 'bg-brand-purple shadow-[0_0_30px_rgba(124,58,237,0.4)]'
              : 'bg-elevated hover:bg-brand-purple/20 border border-[var(--border-default)]'
          }`}
        >
          {isListening ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <MicOff size={24} className="text-white" />
            </motion.div>
          ) : (
            <Mic size={24} className="text-brand-purple" />
          )}
        </motion.button>

        {transcript && !isListening && (
          <Button size="sm" onClick={() => {
            const { fillerWords } = stopListening();
            if (transcript.trim()) {
              onSend(transcript.trim(), fillerWords);
              resetTranscript();
            }
          }}>
            <Send size={14} />
            Send
          </Button>
        )}
      </div>
    </div>
  );
}
