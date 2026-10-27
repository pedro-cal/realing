import Fastify from 'fastify';
import cors from '@fastify/cors';
import { fastifyTRPCPlugin, type CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { appRouter } from './routers/app.router';
import { createContext } from './context';
import type { IAIEnginePort } from '@repo/ai-engine';
import type { IEmailServicePort } from '@repo/domain';
import type { IAuthRepository } from './repositories/auth.repository';

export interface ServerOptions {
  aiEngine?: IAIEnginePort;
  emailService?: IEmailServicePort;
  authRepo?: IAuthRepository;
  jwtSecret?: string;
}

export function buildServer(opts: ServerOptions = {}) {
  const server = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  server.register(cors, {
    origin: true,
    credentials: true,
  });

  // Health check endpoint
  server.get('/health', async () => {
    return {
      status: 'ok',
      service: 'lingua-api',
      timestamp: new Date().toISOString(),
    };
  });

  // Register tRPC fastify plugin
  server.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext: (fastifyOpts: CreateFastifyContextOptions) =>
        createContext(fastifyOpts, {
          aiEngine: opts.aiEngine,
          emailService: opts.emailService,
          authRepo: opts.authRepo,
          jwtSecret: opts.jwtSecret,
        }),
    },
  });

  return server;
}

// Start standalone server when executed directly
if (process.argv[1]?.endsWith('server.ts') || process.argv[1]?.endsWith('server.js')) {
  const port = Number(process.env.PORT) || 4000;
  const server = buildServer();

  server.listen({ port, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    server.log.info(`API Server listening at ${address}`);
  });
}
