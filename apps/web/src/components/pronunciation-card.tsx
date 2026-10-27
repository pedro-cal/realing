import React from 'react';
import type { PronunciationReport } from '@repo/contracts';

interface PronunciationCardProps {
  report: PronunciationReport;
}

export function PronunciationCard({ report }: PronunciationCardProps): React.JSX.Element {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40';
    if (score >= 75) return 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/40';
    return 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/40';
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Pronunciation Assessment
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Target: &ldquo;{report.targetText}&rdquo;</p>
        </div>
        <div className={`flex flex-col items-center rounded-lg border px-4 py-2 font-mono font-bold ${getScoreColor(report.overallScore)}`}>
          <span className="text-2xl">{report.overallScore}</span>
          <span className="text-xs uppercase tracking-wider">Score</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
          <div className="text-xs text-slate-500">Accuracy</div>
          <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">{report.accuracyScore}%</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
          <div className="text-xs text-slate-500">Fluency</div>
          <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">{report.fluencyScore}%</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
          <div className="text-xs text-slate-500">Completeness</div>
          <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">{report.completenessScore}%</div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
          AI Tutor Feedback
        </h4>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
          {report.pedagogicalFeedback}
        </p>
      </div>
    </div>
  );
}
