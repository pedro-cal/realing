import { describe, it, expect } from 'vitest';
import { processAudioEvaluationJob } from '../processors/audio-evaluator';
import { MockAiAdapter } from '@repo/ai-engine';
import type { Job } from 'bullmq';
import type { AudioEvaluationJobPayload } from '@repo/queue';

describe('Audio Evaluation Job Processor', () => {
  it('processes speech audio job and outputs valid pronunciation report', async () => {
    const mockJob = {
      id: 'job-123',
      data: {
        submissionId: '123e4567-e89b-12d3-a456-426614174000',
        audioId: '123e4567-e89b-12d3-a456-426614174001',
        audioStorageKey: 'audio/user-1/sample.opus',
        targetText: 'Buenos días amigos',
        targetLanguage: 'es-ES',
      },
    } as unknown as Job<AudioEvaluationJobPayload>;

    const aiEngine = new MockAiAdapter();
    const report = await processAudioEvaluationJob(mockJob, { aiEngine });

    expect(report.submissionId).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.words.length).toBe(3);
    expect(report.pedagogicalFeedback).toBeDefined();
  });
});
