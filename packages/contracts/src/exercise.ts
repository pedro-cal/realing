import { z } from 'zod';

export const ExerciseTypeSchema = z.enum([
  'pronunciation_drill',
  'listen_and_repeat',
  'ai_dialogue',
  'vocabulary_flashcard',
]);

export type ExerciseType = z.infer<typeof ExerciseTypeSchema>;

export const ExerciseSchema = z.object({
  id: z.string().uuid(),
  lessonId: z.string().uuid(),
  type: ExerciseTypeSchema,
  promptText: z.string(),
  targetPhonemes: z.string().optional(), // IPA representation
  referenceAudioUrl: z.string().url().optional(),
  orderIndex: z.number().int().nonnegative(),
});

export type Exercise = z.infer<typeof ExerciseSchema>;

export const LessonSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().max(500),
  orderIndex: z.number().int().nonnegative(),
  exercises: z.array(ExerciseSchema).default([]),
});

export type Lesson = z.infer<typeof LessonSchema>;

export const CourseSchema = z.object({
  id: z.string().uuid(),
  creatorId: z.string().uuid(),
  title: z.string().min(3).max(120),
  description: z.string(),
  sourceLanguage: z.string().min(2).max(10),
  targetLanguage: z.string().min(2).max(10),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  isPublished: z.boolean().default(false),
  createdAt: z.string().datetime(),
});

export type Course = z.infer<typeof CourseSchema>;
