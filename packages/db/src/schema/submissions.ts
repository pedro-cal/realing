import { pgTable, uuid, varchar, integer, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { exercises } from './courses';

export const submissions = pgTable(
  'submissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    audioStorageKey: varchar('audio_storage_key', { length: 255 }).notNull(),
    audioFormat: varchar('audio_format', { length: 50 }).notNull().default('audio/webm;codecs=opus'),
    durationSeconds: integer('duration_seconds').notNull().default(0),
    status: varchar('status', { length: 50 }).notNull().default('PROCESSING'), // 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_submissions_user').on(table.userId),
    index('idx_submissions_exercise').on(table.exerciseId),
    index('idx_submissions_status').on(table.status),
  ]
);

export const evaluations = pgTable(
  'evaluations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    submissionId: uuid('submission_id')
      .notNull()
      .unique()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    overallScore: integer('overall_score').notNull(),
    accuracyScore: integer('accuracy_score').notNull(),
    fluencyScore: integer('fluency_score').notNull(),
    completenessScore: integer('completeness_score').notNull(),
    wordsJson: jsonb('words_json').notNull(), // Detailed phoneme-level assessments
    pedagogicalFeedback: text('pedagogical_feedback').notNull(),
    evaluatedAt: timestamp('evaluated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_evaluations_submission').on(table.submissionId),
    index('idx_evaluations_overall_score').on(table.overallScore),
  ]
);

export const submissionsRelations = relations(submissions, ({ one }) => ({
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
  exercise: one(exercises, {
    fields: [submissions.exerciseId],
    references: [exercises.id],
  }),
  evaluation: one(evaluations, {
    fields: [submissions.id],
    references: [evaluations.submissionId],
  }),
}));

export const evaluationsRelations = relations(evaluations, ({ one }) => ({
  submission: one(submissions, {
    fields: [evaluations.submissionId],
    references: [submissions.id],
  }),
}));
