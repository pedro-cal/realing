import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../server';
import { MockAiAdapter } from '@repo/ai-engine';
import { MockEmailAdapter } from '@repo/domain';
import { InMemoryAuthRepository } from '../repositories/auth.repository';
import type { FastifyInstance } from 'fastify';

describe('Authentication, JWT & Password Recovery Integration', () => {
  let server: FastifyInstance;
  let emailService: MockEmailAdapter;
  let authRepo: InMemoryAuthRepository;

  beforeAll(async () => {
    emailService = new MockEmailAdapter();
    authRepo = new InMemoryAuthRepository();

    server = buildServer({
      aiEngine: new MockAiAdapter(),
      emailService,
      authRepo,
      jwtSecret: 'test-secret-key-1234567890',
    });

    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  const testEmail = 'newstudent@lingua.io';
  const initialPassword = 'initialSecurePassword123!';
  let activeRefreshToken = '';
  let activeAccessToken = '';

  it('registers a new user and returns JWT access + refresh tokens', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/trpc/auth.register',
      payload: {
        email: testEmail,
        password: initialPassword,
        displayName: 'New Student',
        nativeLanguage: 'en-US',
        learningLanguages: ['es-ES', 'fr-FR'],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const data = body.result.data;

    expect(data.user.email).toBe(testEmail);
    expect(data.user.roles).toHaveLength(1);
    expect(data.user.roles[0].role).toBe('student');

    expect(data.tokens.accessToken).toBeDefined();
    expect(data.tokens.refreshToken).toBeDefined();
    expect(data.tokens.tokenType).toBe('Bearer');
    expect(data.tokens.expiresIn).toBe(900);

    activeAccessToken = data.tokens.accessToken;
    activeRefreshToken = data.tokens.refreshToken;
  });

  it('rejects duplicate user registration with 409 CONFLICT', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/trpc/auth.register',
      payload: {
        email: testEmail,
        password: 'anotherPassword123!',
        displayName: 'Duplicate',
        nativeLanguage: 'en-US',
        learningLanguages: ['es-ES'],
      },
    });

    expect(res.statusCode).toBe(409);
    const body = JSON.parse(res.body);
    expect(body.error.message).toContain('already exists');
  });

  it('authenticates with JWT token on protected procedure auth.me', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/trpc/auth.me',
      headers: {
        authorization: `Bearer ${activeAccessToken}`,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.result.data.email).toBe(testEmail);
    expect(body.result.data.displayName).toBe('New Student');
  });

  it('logs in with correct password and yields valid tokens', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/trpc/auth.login',
      payload: {
        email: testEmail,
        password: initialPassword,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.result.data.tokens.accessToken).toBeDefined();

    // Update active refresh token to the latest one
    activeRefreshToken = body.result.data.tokens.refreshToken;
  });

  it('rejects login with incorrect password', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/trpc/auth.login',
      payload: {
        email: testEmail,
        password: 'WrongPassword!',
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body.error.message).toContain('Invalid email or password');
  });

  it('rotates refresh token and issues a fresh token pair', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/trpc/auth.refreshToken',
      payload: {
        refreshToken: activeRefreshToken,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const newTokens = body.result.data;

    expect(newTokens.accessToken).toBeDefined();
    expect(newTokens.refreshToken).toBeDefined();
    expect(newTokens.refreshToken).not.toBe(activeRefreshToken); // Must rotate

    const previousRefreshToken = activeRefreshToken;
    activeRefreshToken = newTokens.refreshToken;

    // Verify old refresh token is now revoked
    const reusedRes = await server.inject({
      method: 'POST',
      url: '/trpc/auth.refreshToken',
      payload: {
        refreshToken: previousRefreshToken,
      },
    });

    expect(reusedRes.statusCode).toBe(401);
  });

  let rawResetToken = '';

  it('initiates forgot password flow and dispatches email with secure token', async () => {
    emailService.clear();

    const res = await server.inject({
      method: 'POST',
      url: '/trpc/auth.forgotPassword',
      payload: {
        email: testEmail,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.result.data.message).toContain('If an account exists');

    // Verify email was dispatched
    expect(emailService.sentEmails).toHaveLength(1);
    const sentEmail = emailService.getLastEmail();
    expect(sentEmail?.to).toBe(testEmail);
    expect(sentEmail?.resetUrl).toContain('token=');

    // Extract raw token from reset URL
    const url = new URL(sentEmail!.resetUrl);
    rawResetToken = url.searchParams.get('token')!;
    expect(rawResetToken).toBeDefined();
    expect(rawResetToken.length).toBeGreaterThanOrEqual(32);
  });

  const updatedPassword = 'newUpdatedPassword456!';

  it('resets password using valid token and revokes active sessions', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/trpc/auth.resetPassword',
      payload: {
        token: rawResetToken,
        newPassword: updatedPassword,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.result.data.message).toContain('successfully updated');

    // Attempting to reuse the reset token must be rejected (replay protection)
    const replayRes = await server.inject({
      method: 'POST',
      url: '/trpc/auth.resetPassword',
      payload: {
        token: rawResetToken,
        newPassword: 'anotherAttemptPassword',
      },
    });
    expect(replayRes.statusCode).toBe(400);

    // Old refresh token must be revoked
    const refreshRes = await server.inject({
      method: 'POST',
      url: '/trpc/auth.refreshToken',
      payload: {
        refreshToken: activeRefreshToken,
      },
    });
    expect(refreshRes.statusCode).toBe(401);

    // Login with old password must fail
    const oldLoginRes = await server.inject({
      method: 'POST',
      url: '/trpc/auth.login',
      payload: {
        email: testEmail,
        password: initialPassword,
      },
    });
    expect(oldLoginRes.statusCode).toBe(401);

    // Login with new password must succeed!
    const newLoginRes = await server.inject({
      method: 'POST',
      url: '/trpc/auth.login',
      payload: {
        email: testEmail,
        password: updatedPassword,
      },
    });
    expect(newLoginRes.statusCode).toBe(200);
  });
});
