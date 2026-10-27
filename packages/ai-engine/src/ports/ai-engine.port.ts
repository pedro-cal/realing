import type { PronunciationReport } from '@repo/contracts';

export interface PronunciationEvaluationInput {
  submissionId: string;
  audioId: string;
  audioStreamOrBuffer: Uint8Array | ReadableStream;
  targetText: string;
  targetLanguage: string;
}

export interface ConversationTurn {
  role: 'user' | 'tutor' | 'system';
  content: string;
}

export interface ConversationContext {
  userId: string;
  targetLanguage: string;
  studentProficiencyLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  scenarioPrompt: string;
  history: ConversationTurn[];
}

export interface TutorDelta {
  textDelta: string;
  isFinished: boolean;
  correctionFeedback?: string; // Real-time gentle grammar/vocabulary advice
}

export interface VoiceConfig {
  language: string;
  gender?: 'male' | 'female' | 'neutral';
  speed?: number; // 0.75 - 1.25
}

/**
 * Core domain port for all AI capabilities.
 * Concrete implementations can be Cloud AI APIs (Day 1),
 * in-memory mocks (Testing/CI), or a dedicated Python gRPC worker (Future scale).
 */
export interface IAIEnginePort {
  evaluatePronunciation(input: PronunciationEvaluationInput): Promise<PronunciationReport>;

  streamTutorConversation(context: ConversationContext): AsyncIterable<TutorDelta>;

  transcribeSpeech(audioBuffer: Uint8Array, language: string): Promise<{ text: string; confidence: number }>;

  synthesizeSpeech(text: string, config: VoiceConfig): Promise<Uint8Array>;
}
