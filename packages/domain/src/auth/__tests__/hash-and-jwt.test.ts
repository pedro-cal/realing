import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  hashToken,
  generateSecureToken,
  signAccessToken,
  verifyAccessToken,
  MockEmailAdapter,
} from '../../server';

describe('Password Hashing & Cryptographic Utilities', () => {
  it('hashes password and verifies candidate correctly', async () => {
    const password = 'mySuperSecurePassword123!';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.startsWith('$2')).toBe(true); // bcrypt prefix

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword('wrongPassword', hash);
    expect(isInvalid).toBe(false);
  });

  it('generates SHA-256 token hash and secure random hex strings', () => {
    const token = generateSecureToken(32);
    expect(token).toHaveLength(64); // 32 bytes = 64 hex chars

    const hash1 = hashToken(token);
    const hash2 = hashToken(token);
    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2); // Deterministic hash
  });
});

describe('JWT Access Token Lifecycle', () => {
  const secret = 'super-secret-test-jwt-signing-key-12345';

  it('signs and verifies access token with embedded user claims and accumulated roles', () => {
    const payload = {
      sub: '123e4567-e89b-12d3-a456-426614174000',
      email: 'alex@lingua.io',
      displayName: 'Alex Polyglot',
      roles: [
        { role: 'student' as const, scope: { languageId: 'ja-JP' } },
        { role: 'teacher' as const, scope: { languageId: 'pt-BR' } },
        { role: 'monitor' as const },
      ],
    };

    const token = signAccessToken(payload, secret);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token, secret);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.displayName).toBe(payload.displayName);
    expect(decoded.roles).toHaveLength(3);
    expect(decoded.roles[0]?.role).toBe('student');
  });

  it('rejects access token signed with different secret', () => {
    const payload = {
      sub: 'usr-1',
      email: 'test@lingua.io',
      displayName: 'Test',
      roles: [{ role: 'student' as const }],
    };

    const token = signAccessToken(payload, secret);
    expect(() => verifyAccessToken(token, 'different-wrong-secret')).toThrow();
  });
});

describe('Email Service Port & Mock Adapter', () => {
  it('records sent password reset email in memory', async () => {
    const emailAdapter = new MockEmailAdapter();
    expect(emailAdapter.sentEmails).toHaveLength(0);

    await emailAdapter.sendPasswordResetEmail({
      to: 'student@lingua.io',
      resetUrl: 'https://lingua.io/reset-password?token=mock_reset_token_123',
      displayName: 'Student User',
    });

    expect(emailAdapter.sentEmails).toHaveLength(1);
    const last = emailAdapter.getLastEmail();
    expect(last?.to).toBe('student@lingua.io');
    expect(last?.resetUrl).toContain('token=mock_reset_token_123');
    expect(last?.displayName).toBe('Student User');
  });
});
