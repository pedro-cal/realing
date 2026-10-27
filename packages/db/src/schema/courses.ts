import { pgTable, uuid, varchar, text, boolean, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const courses = pgTable(
  'courses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    creatorId: uuid('creator_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    title: varchar('title', { length: 150 }).notNull(),
    description: text('description').notNull(),
    sourceLanguage: varchar('source_language', { length: 10 }).notNull(),
    targetLanguage: varchar('target_language', { length: 10 }).notNull(),
    level: varchar('level', { length: 10 }).notNull().default('A1'),
    isPublished: boolean('is_published').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_courses_creator').on(table.creatorId),
    index('idx_courses_target_lang').on(table.targetLanguage),
  ]
);

export const lessons = pgTable(
  'lessons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 150 }).notNull(),
    description: text('description'),
    orderIndex: integer('order_index').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_lessons_course').on(table.courseId),
  ]
);

export const exercises = pgTable(
  'exercises',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 50 }).notNull().default('pronunciation_drill'),
    promptText: text('prompt_text').notNull(),
    targetPhonemes: text('target_phonemes'),
    referenceAudioUrl: text('reference_audio_url'),
    orderIndex: integer('order_index').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_exercises_lesson').on(table.lessonId),
  ]
);

export const coursesRelations = relations(courses, ({ one, many }) => ({
  creator: one(users, {
    fields: [courses.creatorId],
    references: [users.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one }) => ({
  lesson: one(lessons, {
    fields: [exercises.lessonId],
    references: [lessons.id],
  }),
}));
