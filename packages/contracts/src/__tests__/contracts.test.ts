import { describe, it, expect } from 'vitest';
import {
  UserProfileSchema,
  RoleAssignmentSchema,
  PresignedUploadRequestSchema,
  PronunciationReportSchema,
  CourseSchema,
  AuthTokensSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
} from '../index';

describe('Contracts Zod Schemas', () => {
  it('validates a user profile with multiple accumulated roles', () => {
    const validProfile = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      email: 'alex@lingua.io',
      displayName: 'Alex Polyglot',
      nativeLanguage: 'pt-BR',
      learningLanguages: ['en-US', 'ja-JP'],
      roles: [
        { role: 'student', scope: { languageId: 'ja-JP' } },
        { role: 'teacher', scope: { languageId: 'pt-BR' } },
        { role: 'monitor' },
      ],
      createdAt: new Date().toISOString(),
    };

    const parsed = UserProfileSchema.safeParse(validProfile);
    expect(parsed.success).toBe(true);
  });

  it('rejects an invalid role assignment', () => {
    const invalidAssignment = {
      role: 'super_master_invalid_role',
    };
    const parsed = RoleAssignmentSchema.safeParse(invalidAssignment);
    expect(parsed.success).toBe(false);
  });

  it('validates a presigned audio upload request', () => {
    const validRequest = {
      purpose: 'pronunciation_drill',
      contentType: 'audio/webm;codecs=opus',
      contentLengthBytes: 1024 * 500, // 500KB
      expectedDurationSeconds: 15,
      exerciseId: '123e4567-e89b-12d3-a456-426614174000',
      targetLanguage: 'en-US',
    };

    const parsed = PresignedUploadRequestSchema.safeParse(validRequest);
    expect(parsed.success).toBe(true);
  });

  it('rejects upload requests exceeding max file size', () => {
    const oversizedRequest = {
      purpose: 'pronunciation_drill',
      contentType: 'audio/webm;codecs=opus',
      contentLengthBytes: 30 * 1024 * 1024, // 30MB (max is 25MB)
    };

    const parsed = PresignedUploadRequestSchema.safeParse(oversizedRequest);
    expect(parsed.success).toBe(false);
  });

  it('validates a detailed phoneme-level pronunciation report', () => {
    const validReport = {
      submissionId: '123e4567-e89b-12d3-a456-426614174001',
      audioId: '123e4567-e89b-12d3-a456-426614174002',
      targetText: 'Hello world',
      recognizedText: 'Hello world',
      overallScore: 92,
      accuracyScore: 95,
      fluencyScore: 88,
      completenessScore: 100,
      words: [
        {
          word: 'Hello',
          startTimeMs: 100,
          endTimeMs: 600,
          score: 95,
          phonemes: [
            { phoneme: 'h', score: 98, status: 'correct' },
            { phoneme: 'ə', score: 92, status: 'correct' },
            { phoneme: 'l', score: 96, status: 'correct' },
            { phoneme: 'oʊ', score: 94, status: 'correct' },
          ],
        },
      ],
      pedagogicalFeedback: 'Excellent articulation on the open vowel!',
      evaluatedAt: new Date().toISOString(),
    };

    const parsed = PronunciationReportSchema.safeParse(validReport);
    expect(parsed.success).toBe(true);
  });

  it('validates a course creation schema', () => {
    const validCourse = {
      id: '123e4567-e89b-12d3-a456-426614174003',
      creatorId: '123e4567-e89b-12d3-a456-426614174004',
      title: 'Conversational Japanese for Beginners',
      description: 'Master everyday greetings, ordering at restaurants, and basic pitch accents.',
      sourceLanguage: 'en-US',
      targetLanguage: 'ja-JP',
      level: 'A1',
      isPublished: true,
      createdAt: new Date().toISOString(),
    };

    const parsed = CourseSchema.safeParse(validCourse);
    expect(parsed.success).toBe(true);
  });

  it('validates auth tokens schema', () => {
    const validTokens = {
      accessToken: 'sample.jwt.access.token',
      refreshToken: 'sample.refresh.token.64charslonghereabcdef1234567890',
      tokenType: 'Bearer' as const,
      expiresIn: 900,
    };
    const parsed = AuthTokensSchema.safeParse(validTokens);
    expect(parsed.success).toBe(true);
  });

  it('validates forgot password and reset password schemas', () => {
    const validForgot = { email: 'student@lingua.io' };
    expect(ForgotPasswordRequestSchema.safeParse(validForgot).success).toBe(true);
    expect(ForgotPasswordRequestSchema.safeParse({ email: 'invalid-email' }).success).toBe(false);

    const validReset = {
      token: 'secure_random_reset_token_with_sufficient_length_12345',
      newPassword: 'newSecurePassword123!',
    };
    expect(ResetPasswordRequestSchema.safeParse(validReset).success).toBe(true);
    expect(ResetPasswordRequestSchema.safeParse({ token: 'short', newPassword: '123' }).success).toBe(false);
  });
});
