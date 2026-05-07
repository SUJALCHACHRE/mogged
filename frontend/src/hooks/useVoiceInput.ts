import { useState, useRef, useCallback } from 'react';
import type { FillerWordData } from '../types';
import { FILLER_WORDS } from '../lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionType = any;

export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  const detectFillers = useCallback((text: string): FillerWordData => {
    const lower = text.toLowerCase();
    const counts: Record<string, number> = {};
    let total = 0;

    for (const filler of FILLER_WORDS) {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches) {
        counts[filler] = matches.length;
        total += matches.length;
      }
    }

    return {
      count: total,
      words: Object.entries(counts).map(([word, count]) => ({ word, count })),
    };
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalText = '';
      let interimText = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      setTranscript(finalText);
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: Event) => {
      console.error('Speech recognition error:', event);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript('');
    setInterimTranscript('');
  }, []);

  const stopListening = useCallback((): { transcript: string; fillerWords: FillerWordData } => {
    recognitionRef.current?.stop();
    setIsListening(false);
    const fullTranscript = transcript + interimTranscript;
    const fillerWords = detectFillers(fullTranscript);
    setInterimTranscript('');
    return { transcript: fullTranscript, fillerWords };
  }, [transcript, interimTranscript, detectFillers]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript: transcript + interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: !!(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    ),
  };
}
