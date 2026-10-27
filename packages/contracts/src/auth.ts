import { z } from 'zod';

export const RoleNameSchema = z.enum([
  'admin',
  'course_creator',
  'teacher',
  'monitor',
  'student',
]);

export type RoleName = z.infer<typeof RoleNameSchema>;

export const RoleAssignmentSchema = z.object({
  role: RoleNameSchema,
  scope: z
    .object({
      courseId: z.string().uuid().optional(),
      languageId: z.string().min(2).max(10).optional(),
    })
    .optional(),
});

export type RoleAssignment = z.infer<typeof RoleAssignmentSchema>;

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(2).max(50),
  nativeLanguage: z.string().min(2).max(10),
  learningLanguages: z.array(z.string().min(2).max(10)),
  roles: z.array(RoleAssignmentSchema),
  avatarUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const SignupRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(50),
  nativeLanguage: z.string().min(2).max(10),
  learningLanguages: z.array(z.string().min(2).max(10)).min(1),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.literal('Bearer').default('Bearer'),
  expiresIn: z.number().int().positive(), // in seconds (e.g. 900 for 15m)
});

export type AuthTokens = z.infer<typeof AuthTokensSchema>;

export const AuthResponseSchema = z.object({
  user: UserProfileSchema,
  tokens: AuthTokensSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(20),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

export const ForgotPasswordResponseSchema = z.object({
  message: z.string(),
});

export type ForgotPasswordResponse = z.infer<typeof ForgotPasswordResponseSchema>;

export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(20),
  newPassword: z.string().min(8),
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

export const ResetPasswordResponseSchema = z.object({
  message: z.string(),
});

export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;
