import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';
import { type Permission, hasPermission } from '@repo/domain';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

/**
 * Middleware that asserts the request is authenticated.
 */
const isAuthenticated = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required to access this resource.',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthenticated);

/**
 * Higher-order procedure enforcing cumulative PBAC permissions.
 * Checks whether the user's accumulated roles satisfy the required permission.
 */
export function createPermissionProcedure(
  requiredPermission: Permission,
  getContext?: (rawInput: unknown) => { courseId?: string; languageId?: string } | undefined
) {
  return protectedProcedure.use(async ({ ctx, rawInput, next }) => {
    const scopeContext = getContext ? getContext(rawInput) : undefined;
    const permitted = hasPermission(ctx.user.roles, requiredPermission, scopeContext);

    if (!permitted) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Missing required permission: '${requiredPermission}'`,
      });
    }

    return next({ ctx });
  });
}
