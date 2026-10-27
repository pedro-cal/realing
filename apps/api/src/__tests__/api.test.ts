import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../server';
import { MockAiAdapter } from '@repo/ai-engine';
import type { FastifyInstance } from 'fastify';

describe('API Server & Cumulative PBAC Integration', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = buildServer({ aiEngine: new MockAiAdapter() });
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  it('responds with status 200 on /health probe', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/health',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('lingua-api');
  });

  it('rejects unauthenticated requests to protected procedures with 401', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/trpc/auth.me',
    });

    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(401);
    expect(body.error.message).toContain('Authentication required');
  });

  it('permits authenticated user with student role to request presigned audio upload', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/trpc/audio.requestPresignedUpload',
      headers: {
        authorization: 'Bearer test-student-teacher',
        'content-type': 'application/json',
      },
      payload: {
        purpose: 'pronunciation_drill',
        contentType: 'audio/webm;codecs=opus',
        contentLengthBytes: 50000,
        expectedDurationSeconds: 10,
        targetLanguage: 'fr-FR',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.result.data.audioId).toBeDefined();
    expect(body.result.data.uploadUrl).toContain('https://storage.lingua.io/');
    expect(body.result.data.storageKey).toContain('.opus');
  });

  it('forbids student role from creating courses (missing course:create permission)', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/trpc/course.create',
      headers: {
        authorization: 'Bearer test-student-teacher', // Has student + teacher, neither has course:create
        'content-type': 'application/json',
      },
      payload: {
        title: 'Unauthorized Course',
        description: 'Should fail',
        sourceLanguage: 'en-US',
        targetLanguage: 'de-DE',
        level: 'B1',
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.error.message).toContain("Missing required permission: 'course:create'");
  });

  it('allows admin role to create courses due to SYSTEM_ADMIN bypass', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/trpc/course.create',
      headers: {
        authorization: 'Bearer test-admin',
        'content-type': 'application/json',
      },
      payload: {
        title: 'Admin Masterclass',
        description: 'Superuser course',
        sourceLanguage: 'en-US',
        targetLanguage: 'ja-JP',
        level: 'C1',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.result.data.title).toBe('Admin Masterclass');
    expect(body.result.data.id).toBeDefined();
  });

  it('evaluates pronunciation via the injected AI Engine Port', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/trpc/audio.evaluatePronunciation',
      headers: {
        authorization: 'Bearer test-student-teacher',
        'content-type': 'application/json',
      },
      payload: {
        submissionId: '123e4567-e89b-12d3-a456-426614174000',
        audioId: '123e4567-e89b-12d3-a456-426614174001',
        targetText: 'Bonjour madame',
        targetLanguage: 'fr-FR',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const report = body.result.data;
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.words.length).toBe(2);
    expect(report.pedagogicalFeedback).toBeDefined();
  });

  it('confirms audio upload and enqueues evaluation job', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/trpc/audio.confirmUpload',
      headers: {
        authorization: 'Bearer test-student-teacher',
        'content-type': 'application/json',
      },
      payload: {
        audioId: '123e4567-e89b-12d3-a456-426614174001',
        storageKey: 'audio/user-1/sample.opus',
        durationSeconds: 8,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.result.data.status).toBe('queued');
    expect(body.result.data.submissionId).toBeDefined();
    expect(body.result.data.audioId).toBe('123e4567-e89b-12d3-a456-426614174001');
  });
});
