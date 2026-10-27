import { router, publicProcedure, protectedProcedure } from '../trpc';
import {
  LoginRequestSchema,
  SignupRequestSchema,
  AuthResponseSchema,
  AuthTokensSchema,
  RefreshTokenRequestSchema,
  ForgotPasswordRequestSchema,
  ForgotPasswordResponseSchema,
  ResetPasswordRequestSchema,
  ResetPasswordResponseSchema,
} from '@repo/contracts';
import {
  hashPassword,
  verifyPassword,
  hashToken,
  generateSecureToken,
  signAccessToken,
  ACCESS_TOKEN_EXPIRATION_SECONDS,
} from '@repo/domain/server';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const authRouter = router({
  me: protectedProcedure.query(({ ctx }) => {
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      displayName: ctx.user.displayName,
      roles: ctx.user.roles,
    };
  }),

  register: publicProcedure
    .input(SignupRequestSchema)
    .output(AuthResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.authRepo.findUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'An account with this email address already exists.',
        });
      }

      const passwordHash = await hashPassword(input.password);
      const user = await ctx.authRepo.createUser({
        email: input.email,
        passwordHash,
        displayName: input.displayName,
        nativeLanguage: input.nativeLanguage,
        learningLanguages: input.learningLanguages,
      });

      const accessToken = signAccessToken(
        {
          sub: user.id,
          email: user.email,
          displayName: user.displayName,
          roles: user.roles,
        },
        ctx.jwtSecret
      );

      const rawRefreshToken = generateSecureToken(32);
      const tokenHash = hashToken(rawRefreshToken);
      const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000); // 30 days

      await ctx.authRepo.saveRefreshToken({
        userId: user.id,
        tokenHash,
        expiresAt: refreshTokenExpiresAt,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          nativeLanguage: user.nativeLanguage,
          learningLanguages: user.learningLanguages,
          roles: user.roles,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        },
        tokens: {
          accessToken,
          refreshToken: rawRefreshToken,
          tokenType: 'Bearer',
          expiresIn: ACCESS_TOKEN_EXPIRATION_SECONDS,
        },
      };
    }),

  login: publicProcedure
    .input(LoginRequestSchema)
    .output(AuthResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.authRepo.findUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password.',
        });
      }

      const isPasswordValid = await verifyPassword(input.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password.',
        });
      }

      const accessToken = signAccessToken(
        {
          sub: user.id,
          email: user.email,
          displayName: user.displayName,
          roles: user.roles,
        },
        ctx.jwtSecret
      );

      const rawRefreshToken = generateSecureToken(32);
      const tokenHash = hashToken(rawRefreshToken);
      const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);

      await ctx.authRepo.saveRefreshToken({
        userId: user.id,
        tokenHash,
        expiresAt: refreshTokenExpiresAt,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          nativeLanguage: user.nativeLanguage,
          learningLanguages: user.learningLanguages,
          roles: user.roles,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        },
        tokens: {
          accessToken,
          refreshToken: rawRefreshToken,
          tokenType: 'Bearer',
          expiresIn: ACCESS_TOKEN_EXPIRATION_SECONDS,
        },
      };
    }),

  refreshToken: publicProcedure
    .input(RefreshTokenRequestSchema)
    .output(AuthTokensSchema)
    .mutation(async ({ input, ctx }) => {
      const tokenHash = hashToken(input.refreshToken);
      const storedToken = await ctx.authRepo.findValidRefreshToken(tokenHash);

      if (!storedToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired refresh token.',
        });
      }

      const user = await ctx.authRepo.findUserById(storedToken.userId);
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User associated with refresh token not found.',
        });
      }

      // Rotate: revoke old token
      await ctx.authRepo.revokeRefreshToken(tokenHash);

      // Issue new token pair
      const newAccessToken = signAccessToken(
        {
          sub: user.id,
          email: user.email,
          displayName: user.displayName,
          roles: user.roles,
        },
        ctx.jwtSecret
      );

      const newRawRefreshToken = generateSecureToken(32);
      const newTokenHash = hashToken(newRawRefreshToken);
      const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);

      await ctx.authRepo.saveRefreshToken({
        userId: user.id,
        tokenHash: newTokenHash,
        expiresAt: refreshTokenExpiresAt,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRawRefreshToken,
        tokenType: 'Bearer',
        expiresIn: ACCESS_TOKEN_EXPIRATION_SECONDS,
      };
    }),

  logout: publicProcedure
    .input(RefreshTokenRequestSchema)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const tokenHash = hashToken(input.refreshToken);
      await ctx.authRepo.revokeRefreshToken(tokenHash);
      return { success: true };
    }),

  forgotPassword: publicProcedure
    .input(ForgotPasswordRequestSchema)
    .output(ForgotPasswordResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.authRepo.findUserByEmail(input.email);

      if (user) {
        const rawToken = generateSecureToken(32);
        const tokenHash = hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour TTL

        await ctx.authRepo.savePasswordResetToken({
          userId: user.id,
          tokenHash,
          expiresAt,
        });

        const resetUrl = `https://app.lingua.io/reset-password?token=${rawToken}`;
        await ctx.emailService.sendPasswordResetEmail({
          to: user.email,
          resetUrl,
          displayName: user.displayName,
        });
      }

      // Always return generic success to prevent account enumeration
      return {
        message: 'If an account exists with this email, a reset link has been dispatched.',
      };
    }),

  resetPassword: publicProcedure
    .input(ResetPasswordRequestSchema)
    .output(ResetPasswordResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const tokenHash = hashToken(input.token);
      const storedToken = await ctx.authRepo.findValidPasswordResetToken(tokenHash);

      if (!storedToken) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired password reset token.',
        });
      }

      const newPasswordHash = await hashPassword(input.newPassword);
      await ctx.authRepo.updateUserPassword(storedToken.userId, newPasswordHash);
      await ctx.authRepo.consumePasswordResetToken(tokenHash);
      // Revoke all active sessions upon password reset for security
      await ctx.authRepo.revokeAllUserRefreshTokens(storedToken.userId);

      return {
        message: 'Password has been successfully updated.',
      };
    }),
});
