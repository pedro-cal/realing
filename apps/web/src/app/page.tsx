'use client';

import React, { useState } from 'react';
import { useAudioRecorder } from '../hooks/use-audio-recorder';
import { PronunciationCard } from '../components/pronunciation-card';
import type { PronunciationReport } from '@repo/contracts';

export default function HomePage(): React.JSX.Element {
  const {
    isRecording,
    durationSeconds,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    reset,
  } = useAudioRecorder();

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [report, setReport] = useState<PronunciationReport | null>(null);

  // Mock student profile with accumulated roles
  const currentUser = {
    displayName: 'Alex Polyglot',
    roles: [
      { role: 'student', label: 'Student (Learning French)' },
      { role: 'teacher', label: 'Teacher (Portuguese)' },
      { role: 'monitor', label: 'Community Monitor' },
    ],
  };

  const sampleTargetText = "Bonjour! Comment allez-vous aujourd'hui?";

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    // Simulate API evaluation call
    setTimeout(() => {
      setReport({
        submissionId: 'sub-' + Math.random().toString(36).substring(7),
        audioId: 'aud-' + Math.random().toString(36).substring(7),
        targetText: sampleTargetText,
        recognizedText: sampleTargetText,
        overallScore: 92,
        accuracyScore: 94,
        fluencyScore: 89,
        completenessScore: 97,
        words: [
          {
            word: 'Bonjour',
            startTimeMs: 0,
            endTimeMs: 600,
            score: 95,
            phonemes: [{ phoneme: 'b', score: 96, status: 'correct' }],
          },
        ],
        pedagogicalFeedback:
          'Excellent pronunciation! Your nasal vowel in "Comment" was spot on. Keep practicing the liaison between "allez" and "vous".',
        evaluatedAt: new Date().toISOString(),
      });
      setIsEvaluating(false);
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* User Hero & Cumulative Roles */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 to-indigo-700 p-8 text-white shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser.displayName}
            </h1>
            <p className="mt-1 text-indigo-200">
              Multi-Language Learning Platform • Unified Backend Architecture
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentUser.roles.map((r) => (
              <span
                key={r.role}
                className="rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-semibold backdrop-blur-sm border border-indigo-300/30"
              >
                {r.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Speech Practice Drill */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Pronunciation Drill
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                French Daily Greetings
              </h2>
            </div>
            <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Level A2
            </span>
          </div>

          <div className="mt-6 rounded-lg bg-slate-50 p-5 dark:bg-slate-800/40">
            <p className="text-xs font-medium text-slate-500">Read aloud:</p>
            <p className="mt-2 font-serif text-2xl font-medium text-slate-800 dark:text-slate-100">
              &ldquo;{sampleTargetText}&rdquo;
            </p>
            <p className="mt-1 text-xs text-slate-400">
              IPA: [bɔ̃.ʒuʁ kɔ.mɑ̃ t‿a.le vu o.ʒuʁ.dɥi]
            </p>
          </div>

          {/* Recording Controls */}
          <div className="mt-6 flex flex-col items-center justify-center space-y-4">
            {error && (
              <div className="text-sm font-medium text-rose-500">
                {error}
              </div>
            )}

            <div className="flex items-center space-x-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex items-center space-x-2 rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-indigo-700 active:scale-95"
                >
                  <span className="h-3 w-3 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>Start Speaking</span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center space-x-2 rounded-full bg-rose-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-rose-700 animate-bounce"
                >
                  <span>Stop ({durationSeconds}s)</span>
                </button>
              )}

              {audioUrl && !isRecording && (
                <button
                  onClick={reset}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Retry
                </button>
              )}
            </div>

            {audioUrl && !isRecording && (
              <div className="w-full space-y-3 pt-2">
                <audio src={audioUrl} controls className="w-full h-10" />
                <button
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  className="w-full rounded-lg bg-emerald-600 py-2.5 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isEvaluating ? 'Evaluating with AI...' : 'Submit & Score Pronunciation'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Card */}
        <div>
          {report ? (
            <PronunciationCard report={report} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400 dark:border-slate-800">
              <div className="text-4xl">🎙️</div>
              <p className="mt-3 text-sm font-medium">
                Record your voice and submit to receive instant phoneme accuracy scores and AI feedback.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
