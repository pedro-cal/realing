import { z } from 'zod';

export const AudioFormatSchema = z.enum([
  'audio/webm;codecs=opus',
  'audio/ogg;codecs=opus',
  'audio/mp4',
  'audio/aac',
  'audio/wav',
]);

export type AudioFormat = z.infer<typeof AudioFormatSchema>;

export const AudioUploadPurposeSchema = z.enum([
  'pronunciation_drill',
  'lesson_submission',
  'voice_comment',
  'social_audio_message',
]);

export type AudioUploadPurpose = z.infer<typeof AudioUploadPurposeSchema>;

export const PresignedUploadRequestSchema = z.object({
  purpose: AudioUploadPurposeSchema,
  contentType: AudioFormatSchema,
  contentLengthBytes: z.number().positive().max(25 * 1024 * 1024), // Max 25MB
  expectedDurationSeconds: z.number().positive().max(300).optional(), // Max 5 mins
  exerciseId: z.string().uuid().optional(),
  targetLanguage: z.string().min(2).max(10).optional(),
});

export type PresignedUploadRequest = z.infer<typeof PresignedUploadRequestSchema>;

export const PresignedUploadResponseSchema = z.object({
  audioId: z.string().uuid(),
  storageKey: z.string(),
  uploadUrl: z.string().url(),
  expiresAt: z.string().datetime(),
  headers: z.record(z.string()),
});

export type PresignedUploadResponse = z.infer<typeof PresignedUploadResponseSchema>;

export const ConfirmUploadRequestSchema = z.object({
  audioId: z.string().uuid(),
  storageKey: z.string(),
  durationSeconds: z.number().positive(),
  exerciseId: z.string().uuid().optional(),
});

export type ConfirmUploadRequest = z.infer<typeof ConfirmUploadRequestSchema>;
