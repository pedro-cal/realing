import { Queue } from 'bullmq';
import { redisConnectionOptions } from './connection';

export const AUDIO_EVALUATION_QUEUE = 'audio-evaluation-queue';

export interface AudioEvaluationJobPayload {
  submissionId: string;
  audioId: string;
  audioStorageKey: string;
  targetText: string;
  targetLanguage: string;
}

export function createAudioEvaluationQueue(): Queue<AudioEvaluationJobPayload> {
  return new Queue<AudioEvaluationJobPayload>(AUDIO_EVALUATION_QUEUE, {
    connection: redisConnectionOptions,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: {
        age: 24 * 3600, // Keep completed jobs for 24h
        count: 1000,
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // Keep failed jobs for 7 days
      },
    },
  });
}
