import type { Job } from 'bullmq';
import type { AudioEvaluationJobPayload } from '@repo/queue';
import type { IAIEnginePort } from '@repo/ai-engine';
import type { PronunciationReport } from '@repo/contracts';

export interface ProcessorContext {
  aiEngine: IAIEnginePort;
}

export async function processAudioEvaluationJob(
  job: Job<AudioEvaluationJobPayload>,
  context: ProcessorContext
): Promise<PronunciationReport> {
  const { submissionId, audioId, targetText, targetLanguage } = job.data;

  // In production, fetch audio binary from S3 using storageKey
  const simulatedAudioBuffer = new Uint8Array([0, 1, 2, 3]);

  // Invoke hexagonal AI Port
  const report = await context.aiEngine.evaluatePronunciation({
    submissionId,
    audioId,
    audioStreamOrBuffer: simulatedAudioBuffer,
    targetText,
    targetLanguage,
  });

  return report;
}
