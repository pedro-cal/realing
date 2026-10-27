import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password using bcrypt with salt rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Compares a plaintext candidate password against a stored bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Computes a SHA-256 hash of a token (used for storing refresh and reset tokens safely in DB).
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Generates a cryptographically random hex token (e.g. for refresh tokens or password recovery).
 */
export function generateSecureToken(byteLength: number = 32): string {
  return randomBytes(byteLength).toString('hex');
}
