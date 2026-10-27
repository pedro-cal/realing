import { Worker } from 'bullmq';
import {
  AUDIO_EVALUATION_QUEUE,
  redisConnectionOptions,
  type AudioEvaluationJobPayload,
} from '@repo/queue';
import { MockAiAdapter, type IAIEnginePort } from '@repo/ai-engine';
import { processAudioEvaluationJob } from './processors/audio-evaluator';

export interface WorkerRunnerOptions {
  aiEngine?: IAIEnginePort;
}

export function startWorker(opts: WorkerRunnerOptions = {}) {
  const aiEngine = opts.aiEngine || new MockAiAdapter();

  const worker = new Worker<AudioEvaluationJobPayload>(
    AUDIO_EVALUATION_QUEUE,
    async (job) => {
      console.log(`[Worker] Processing audio evaluation job ${job.id} for submission ${job.data.submissionId}`);
      const report = await processAudioEvaluationJob(job, { aiEngine });
      console.log(`[Worker] Evaluation completed for submission ${job.data.submissionId}. Score: ${report.overallScore}`);
      return report;
    },
    {
      connection: redisConnectionOptions,
      concurrency: 5,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err.message);
  });

  return worker;
}

if (process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js')) {
  console.log('🚀 Starting Audio Evaluation Worker...');
  const worker = startWorker();

  const shutdown = async () => {
    console.log('🛑 Shutting down audio evaluation worker...');
    await worker.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
