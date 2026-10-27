import type {
  IAIEnginePort,
  PronunciationEvaluationInput,
  ConversationContext,
  TutorDelta,
  VoiceConfig,
} from '../ports/ai-engine.port';
import type { PronunciationReport } from '@repo/contracts';

export class MockAiAdapter implements IAIEnginePort {
  async evaluatePronunciation(input: PronunciationEvaluationInput): Promise<PronunciationReport> {
    const words = input.targetText.split(' ').map((word, index) => ({
      word,
      startTimeMs: index * 400,
      endTimeMs: (index + 1) * 400,
      score: 95,
      phonemes: [
        { phoneme: word[0] || 'a', score: 96, status: 'correct' as const },
        { phoneme: word.slice(1) || 'b', score: 94, status: 'correct' as const },
      ],
    }));

    return {
      submissionId: input.submissionId,
      audioId: input.audioId,
      targetText: input.targetText,
      recognizedText: input.targetText,
      overallScore: 94,
      accuracyScore: 95,
      fluencyScore: 92,
      completenessScore: 96,
      words,
      pedagogicalFeedback:
        'Great clarity and rhythm! Keep practicing word stress for longer compound sentences.',
      evaluatedAt: new Date().toISOString(),
    };
  }

  async *streamTutorConversation(_context: ConversationContext): AsyncIterable<TutorDelta> {
    const simulatedTokens = [
      'Bonjour! ',
      "C'est un plaisir ",
      'de parler avec vous. ',
      'Que souhaitez-vous pratiquer aujourd hui?',
    ];

    for (let i = 0; i < simulatedTokens.length; i++) {
      yield {
        textDelta: simulatedTokens[i]!,
        isFinished: i === simulatedTokens.length - 1,
        correctionFeedback:
          i === simulatedTokens.length - 1
            ? 'Note: Remember to liaise vowels smoothly.'
            : undefined,
      };
    }
  }

  async transcribeSpeech(
    _audioBuffer: Uint8Array,
    _language: string
  ): Promise<{ text: string; confidence: number }> {
    return {
      text: 'Simulated transcribed speech text',
      confidence: 0.98,
    };
  }

  async synthesizeSpeech(_text: string, _config: VoiceConfig): Promise<Uint8Array> {
    // Return empty 100-byte buffer simulating PCM audio
    return new Uint8Array(100);
  }
}
