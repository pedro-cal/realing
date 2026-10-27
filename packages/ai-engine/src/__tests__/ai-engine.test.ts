import { describe, it, expect } from 'vitest';
import { MockAiAdapter } from '../index';
import { PronunciationReportSchema } from '@repo/contracts';

describe('AI Engine Hexagonal Adapter', () => {
  const adapter = new MockAiAdapter();

  it('evaluates pronunciation and produces a valid contract report', async () => {
    const report = await adapter.evaluatePronunciation({
      submissionId: '123e4567-e89b-12d3-a456-426614174000',
      audioId: '123e4567-e89b-12d3-a456-426614174001',
      audioStreamOrBuffer: new Uint8Array([1, 2, 3]),
      targetText: 'Bonjour le monde',
      targetLanguage: 'fr-FR',
    });

    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.words.length).toBe(3);
    expect(report.pedagogicalFeedback).toBeDefined();

    // Verify it conforms strictly to our shared Zod schema
    const validation = PronunciationReportSchema.safeParse(report);
    expect(validation.success).toBe(true);
  });

  it('streams tutor dialogue tokens sequentially', async () => {
    const stream = adapter.streamTutorConversation({
      userId: 'test-user',
      targetLanguage: 'fr-FR',
      studentProficiencyLevel: 'A2',
      scenarioPrompt: 'Ordering coffee in Paris',
      history: [],
    });

    const receivedChunks: string[] = [];
    for await (const chunk of stream) {
      receivedChunks.push(chunk.textDelta);
    }

    expect(receivedChunks.length).toBeGreaterThan(0);
    expect(receivedChunks.join('')).toContain('Bonjour');
  });

  it('transcribes speech with confidence metric', async () => {
    const result = await adapter.transcribeSpeech(new Uint8Array([0, 1]), 'en-US');
    expect(result.text).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0.9);
  });
});
