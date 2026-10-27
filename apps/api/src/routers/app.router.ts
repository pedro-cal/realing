import { router } from '../trpc';
import { authRouter } from './auth.router';
import { courseRouter } from './course.router';
import { audioRouter } from './audio.router';

export const appRouter = router({
  auth: authRouter,
  course: courseRouter,
  audio: audioRouter,
});

export type AppRouter = typeof appRouter;
