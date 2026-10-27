'use client';

import { useState, useRef, useCallback } from 'react';
import {
  ExerciseSubmissionStates,
  type ExerciseSubmissionState,
} from '@repo/domain';

export interface UseAudioRecorderReturn {
  state: ExerciseSubmissionState;
  isRecording: boolean;
  durationSeconds: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  reset: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<ExerciseSubmissionState>(ExerciseSubmissionStates.IDLE);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250); // Slice every 250ms for low latency
      setState(ExerciseSubmissionStates.RECORDING);
      setDurationSeconds(0);

      timerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Failed to access microphone.');
      setState(ExerciseSubmissionStates.FAILED);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setState(ExerciseSubmissionStates.IDLE);
    }
  }, []);

  const reset = useCallback(() => {
    setAudioBlob(null);
    setAudioUrl(null);
    setError(null);
    setDurationSeconds(0);
    setState(ExerciseSubmissionStates.IDLE);
  }, []);

  return {
    state,
    isRecording: state === ExerciseSubmissionStates.RECORDING,
    durationSeconds,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    reset,
  };
}
