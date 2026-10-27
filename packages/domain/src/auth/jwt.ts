import jwt, { type SignOptions } from 'jsonwebtoken';
import type { RoleAssignment } from '@repo/contracts';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  displayName: string;
  roles: RoleAssignment[];
}

export const ACCESS_TOKEN_EXPIRATION: SignOptions['expiresIn'] = '15m';
export const ACCESS_TOKEN_EXPIRATION_SECONDS = 15 * 60; // 900s

/**
 * Signs a short-lived access token with embedded user claims and accumulated roles.
 */
export function signAccessToken(
  payload: AccessTokenPayload,
  secret: string,
  expiresIn: SignOptions['expiresIn'] = ACCESS_TOKEN_EXPIRATION
): string {
  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: 'HS256',
  });
}

/**
 * Verifies a JWT access token and extracts the authenticated user payload.
 */
export function verifyAccessToken(token: string, secret: string): AccessTokenPayload {
  const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
  return decoded as AccessTokenPayload;
}
