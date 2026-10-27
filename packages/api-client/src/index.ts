import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@repo/api';

export type { AppRouter };

export const trpc = createTRPCReact<AppRouter>();

export interface ClientConfig {
  baseUrl: string;
  getAuthToken?: () => string | null | Promise<string | null>;
}

export function createApiClient(config: ClientConfig) {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${config.baseUrl}/trpc`,
        async headers() {
          const token = config.getAuthToken ? await config.getAuthToken() : null;
          return token ? { authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}
