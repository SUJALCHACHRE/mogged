import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useInterviewStore } from '../store/interviewStore';
import { supabase } from '../lib/supabase';
import type { FillerWordData } from '../types';

export function useInterviewSocket(sessionId: string) {
  const socketRef = useRef<Socket | null>(null);
  const hasJoinedRef = useRef(false);       // prevents duplicate join_interview
  const isConnectingRef = useRef(false);    // prevents StrictMode double-connect
  const sessionStartRef = useRef(Date.now()); // for relative timestamp_ms

  const {
    addMessage, setMetrics, setInterviewerTyping,
    startInterview, endInterview,
  } = useInterviewStore();

  useEffect(() => {
    if (!sessionId) return;
    if (isConnectingRef.current) return;   // already connecting, bail out
    isConnectingRef.current = true;

    const connectSocket = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';

      const BACKEND_URL = import.meta.env.VITE_API_URL || '';
      const socket = io(BACKEND_URL, {
        auth: { token },
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
      });

      socketRef.current = socket;
      sessionStartRef.current = Date.now();

      socket.on('connect', () => {
        console.log('[WS] Connected:', socket.id);
        // Only emit join_interview once per session lifecycle
        if (!hasJoinedRef.current) {
          hasJoinedRef.current = true;
          socket.emit('join_interview', { session_id: sessionId });
          startInterview();
        }
      });

      socket.on('interviewer_message', (data: { content: string; timestamp_ms: number }) => {
        setInterviewerTyping(false);
        addMessage({
          role: 'interviewer',
          content: data.content,
          timestamp_ms: data.timestamp_ms,
        });
      });

      socket.on('metrics_update', (data) => {
        setMetrics(data);
      });

      socket.on('typing', () => {
        setInterviewerTyping(true);
      });

      socket.on('interview_complete', () => {
        endInterview();
      });

      socket.on('error', (data: { message: string }) => {
        console.error('[WS] Error:', data.message);
      });

      socket.on('disconnect', () => {
        console.log('[WS] Disconnected');
      });
    };

    connectSocket();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      hasJoinedRef.current = false;
      isConnectingRef.current = false;
    };
  }, [sessionId]);

  const sendResponse = useCallback(
    (content: string, fillerWords: FillerWordData, speakingPaceWpm = 0) => {
      // Use relative ms offset from session start — stays within Postgres integer range
      const timestamp_ms = Date.now() - sessionStartRef.current;
      addMessage({
        role: 'candidate',
        content,
        timestamp_ms,
        filler_words: fillerWords,
        speaking_pace_wpm: speakingPaceWpm,
      });
      setInterviewerTyping(true);
      socketRef.current?.emit('candidate_response', {
        session_id: sessionId,
        content,
        filler_words: fillerWords,
        speaking_pace_wpm: speakingPaceWpm,
        timestamp_ms,
      });
    },
    [sessionId, addMessage, setInterviewerTyping],
  );

  return { sendResponse, socket: socketRef.current };
}
