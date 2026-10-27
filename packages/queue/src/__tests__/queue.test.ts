import { describe, it, expect } from 'vitest';
import { AUDIO_EVALUATION_QUEUE, redisConnectionOptions } from '../index';

describe('Audio Queue Specifications', () => {
  it('defines the correct audio evaluation queue identifier', () => {
    expect(AUDIO_EVALUATION_QUEUE).toBe('audio-evaluation-queue');
  });

  it('configures Redis connection with required BullMQ flags', () => {
    expect(redisConnectionOptions.maxRetriesPerRequest).toBeNull();
    expect(redisConnectionOptions.port).toBeDefined();
  });
});
