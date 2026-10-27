import { router, publicProcedure, createPermissionProcedure } from '../trpc';
import { Permissions } from '@repo/domain';
import { z } from 'zod';

const createCourseProcedure = createPermissionProcedure(Permissions.COURSE_CREATE);

export const courseRouter = router({
  list: publicProcedure.query(async () => {
    return [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        creatorId: 'usr-admin-1',
        title: 'Mastering French Phonetics & Pronunciation',
        description: 'Learn French nasal vowels and authentic conversational rhythm.',
        sourceLanguage: 'en-US',
        targetLanguage: 'fr-FR',
        level: 'A2',
        isPublished: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }),

  create: createCourseProcedure
    .input(
      z.object({
        title: z.string().min(3),
        description: z.string(),
        sourceLanguage: z.string(),
        targetLanguage: z.string(),
        level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        id: 'new-course-' + Math.random().toString(36).substring(7),
        creatorId: ctx.user.id,
        ...input,
        isPublished: false,
        createdAt: new Date().toISOString(),
      };
    }),
});
