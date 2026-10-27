import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import type { RoleAssignment } from '@repo/contracts';
import { type IAIEnginePort, MockAiAdapter } from '@repo/ai-engine';
import { verifyAccessToken, type IEmailServicePort, MockEmailAdapter } from '@repo/domain/server';
import { type IAuthRepository, InMemoryAuthRepository } from './repositories/auth.repository';

export interface ApiUser {
  id: string;
  email: string;
  displayName: string;
  roles: RoleAssignment[];
}

export interface Context {
  user: ApiUser | null;
  aiEngine: IAIEnginePort;
  emailService: IEmailServicePort;
  authRepo: IAuthRepository;
  jwtSecret: string;
  req: CreateFastifyContextOptions['req'];
  res: CreateFastifyContextOptions['res'];
}

// Singletons or default adapters for local/dev
const defaultAiEngine = new MockAiAdapter();
const defaultEmailService = new MockEmailAdapter();
const defaultAuthRepo = new InMemoryAuthRepository();
export const DEFAULT_JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-key-lingua-platform-12345';

export interface ContextOverrides {
  aiEngine?: IAIEnginePort;
  emailService?: IEmailServicePort;
  authRepo?: IAuthRepository;
  jwtSecret?: string;
}

export function createContext(
  opts: CreateFastifyContextOptions,
  overrides: ContextOverrides = {}
): Context {
  const jwtSecret = overrides.jwtSecret || DEFAULT_JWT_SECRET;
  const authHeader = opts.req.headers.authorization;
  let user: ApiUser | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    // 1. Check dev test mocks
    if (token === 'test-student-teacher') {
      user = {
        id: 'usr-student-teacher-1',
        email: 'alex@lingua.io',
        displayName: 'Alex Polyglot',
        roles: [{ role: 'student' }, { role: 'teacher' }],
      };
    } else if (token === 'test-admin') {
      user = {
        id: 'usr-admin-1',
        email: 'admin@lingua.io',
        displayName: 'System Admin',
        roles: [{ role: 'admin' }],
      };
    } else {
      // 2. Verify real JWT token
      try {
        const decoded = verifyAccessToken(token, jwtSecret);
        user = {
          id: decoded.sub,
          email: decoded.email,
          displayName: decoded.displayName,
          roles: decoded.roles,
        };
      } catch {
        // Invalid or expired token: user remains null
      }
    }
  }

  return {
    user,
    aiEngine: overrides.aiEngine || defaultAiEngine,
    emailService: overrides.emailService || defaultEmailService,
    authRepo: overrides.authRepo || defaultAuthRepo,
    jwtSecret,
    req: opts.req,
    res: opts.res,
  };
}
