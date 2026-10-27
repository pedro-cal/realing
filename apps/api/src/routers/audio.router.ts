import { randomUUID } from 'node:crypto';
import { router, createPermissionProcedure } from '../trpc';
import {
  PresignedUploadRequestSchema,
  PresignedUploadResponseSchema,
  PronunciationReportSchema,
  ConfirmUploadRequestSchema,
} from '@repo/contracts';
import { Permissions } from '@repo/domain';
import { z } from 'zod';

const submitExerciseProcedure = createPermissionProcedure(Permissions.EXERCISE_SUBMIT);

export const audioRouter = router({
  requestPresignedUpload: submitExerciseProcedure
    .input(PresignedUploadRequestSchema)
    .output(PresignedUploadResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const audioId = randomUUID();
      const storageKey = `audio/${ctx.user.id}/${audioId}.opus`;

      // In production, invoke @aws-sdk/s3-request-presigner
      const uploadUrl = `https://storage.lingua.io/${storageKey}?signature=mock_presigned_url`;

      return {
        audioId,
        storageKey,
        uploadUrl,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        headers: {
          'Content-Type': input.contentType,
        },
      };
    }),

  evaluatePronunciation: submitExerciseProcedure
    .input(
      z.object({
        submissionId: z.string().uuid(),
        audioId: z.string().uuid(),
        targetText: z.string().min(1),
        targetLanguage: z.string().min(2),
      })
    )
    .output(PronunciationReportSchema)
    .mutation(async ({ input, ctx }) => {
      // In production, background worker processes this from BullMQ.
      // Here, the injected Hexagonal AI Port produces the pronunciation report.
      const report = await ctx.aiEngine.evaluatePronunciation({
        submissionId: input.submissionId,
        audioId: input.audioId,
        audioStreamOrBuffer: new Uint8Array([0, 1, 2]),
        targetText: input.targetText,
        targetLanguage: input.targetLanguage,
      });

      return report;
    }),

  confirmUpload: submitExerciseProcedure
    .input(ConfirmUploadRequestSchema)
    .output(
      z.object({
        status: z.enum(['queued', 'processing']),
        submissionId: z.string().uuid(),
        audioId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const submissionId = randomUUID();
      return {
        status: 'queued',
        submissionId,
        audioId: input.audioId,
      };
    }),
});
