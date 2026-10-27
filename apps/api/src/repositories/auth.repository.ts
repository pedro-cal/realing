import type { RoleAssignment } from '@repo/contracts';
import { randomUUID } from 'node:crypto';

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  nativeLanguage: string;
  learningLanguages: string[];
  roles: RoleAssignment[];
  avatarUrl?: string;
  createdAt: string;
}

export interface StoredRefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
}

export interface StoredPasswordResetToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<UserEntity | null>;
  findUserById(id: string): Promise<UserEntity | null>;
  createUser(data: {
    email: string;
    passwordHash: string;
    displayName: string;
    nativeLanguage: string;
    learningLanguages: string[];
  }): Promise<UserEntity>;
  updateUserPassword(userId: string, newPasswordHash: string): Promise<void>;

  saveRefreshToken(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findValidRefreshToken(tokenHash: string): Promise<StoredRefreshToken | null>;
  revokeRefreshToken(tokenHash: string): Promise<void>;
  revokeAllUserRefreshTokens(userId: string): Promise<void>;

  savePasswordResetToken(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findValidPasswordResetToken(tokenHash: string): Promise<StoredPasswordResetToken | null>;
  consumePasswordResetToken(tokenHash: string): Promise<void>;
}

/**
 * In-Memory implementation of IAuthRepository for tests, offline dev, and rapid CI.
 */
export class InMemoryAuthRepository implements IAuthRepository {
  private users: Map<string, UserEntity> = new Map();
  private refreshTokens: Map<string, StoredRefreshToken> = new Map();
  private resetTokens: Map<string, StoredPasswordResetToken> = new Map();

  constructor() {
    // Seed default mock test users with pre-hashed password ('password123')
    const defaultHash = '$2a$10$wTfD7.7b76sT0M3Z2v5u5e3.G9U12kE8fL8Xz2q8x3Q5M9XyLw2iS'; // bcrypt for password123
    const alex: UserEntity = {
      id: 'usr-student-teacher-1',
      email: 'alex@lingua.io',
      passwordHash: defaultHash,
      displayName: 'Alex Polyglot',
      nativeLanguage: 'pt-BR',
      learningLanguages: ['en-US', 'ja-JP'],
      roles: [{ role: 'student' }, { role: 'teacher' }],
      createdAt: new Date().toISOString(),
    };
    this.users.set(alex.id, alex);
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return u;
      }
    }
    return null;
  }

  async findUserById(id: string): Promise<UserEntity | null> {
    return this.users.get(id) || null;
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    displayName: string;
    nativeLanguage: string;
    learningLanguages: string[];
  }): Promise<UserEntity> {
    const id = randomUUID();
    const newUser: UserEntity = {
      id,
      email: data.email,
      passwordHash: data.passwordHash,
      displayName: data.displayName,
      nativeLanguage: data.nativeLanguage,
      learningLanguages: data.learningLanguages,
      roles: [{ role: 'student' }], // Default role on signup
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUserPassword(userId: string, newPasswordHash: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.passwordHash = newPasswordHash;
    }
  }

  async saveRefreshToken(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    const id = randomUUID();
    this.refreshTokens.set(data.tokenHash, {
      id,
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    });
  }

  async findValidRefreshToken(tokenHash: string): Promise<StoredRefreshToken | null> {
    const token = this.refreshTokens.get(tokenHash);
    if (!token) return null;
    if (token.revokedAt) return null;
    if (token.expiresAt.getTime() < Date.now()) return null;
    return token;
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    const token = this.refreshTokens.get(tokenHash);
    if (token) {
      token.revokedAt = new Date();
    }
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    for (const token of this.refreshTokens.values()) {
      if (token.userId === userId) {
        token.revokedAt = new Date();
      }
    }
  }

  async savePasswordResetToken(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    const id = randomUUID();
    this.resetTokens.set(data.tokenHash, {
      id,
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    });
  }

  async findValidPasswordResetToken(tokenHash: string): Promise<StoredPasswordResetToken | null> {
    const token = this.resetTokens.get(tokenHash);
    if (!token) return null;
    if (token.usedAt) return null;
    if (token.expiresAt.getTime() < Date.now()) return null;
    return token;
  }

  async consumePasswordResetToken(tokenHash: string): Promise<void> {
    const token = this.resetTokens.get(tokenHash);
    if (token) {
      token.usedAt = new Date();
    }
  }
}
