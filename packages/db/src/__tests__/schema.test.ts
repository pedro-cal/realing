import { describe, it, expect } from 'vitest';
import {
  users,
  userRoles,
  refreshTokens,
  passwordResetTokens,
  courses,
  lessons,
  exercises,
  submissions,
  evaluations,
} from '../schema';
import { getTableColumns } from 'drizzle-orm';

describe('Database Schema Definitions', () => {
  it('defines the users table with appropriate security and language fields', () => {
    const cols = getTableColumns(users);
    expect(cols.id).toBeDefined();
    expect(cols.email).toBeDefined();
    expect(cols.passwordHash).toBeDefined();
    expect(cols.displayName).toBeDefined();
    expect(cols.nativeLanguage).toBeDefined();
    expect(cols.createdAt).toBeDefined();
  });

  it('defines user_roles with scoping columns for cumulative permissions', () => {
    const cols = getTableColumns(userRoles);
    expect(cols.userId).toBeDefined();
    expect(cols.role).toBeDefined();
    expect(cols.courseId).toBeDefined();
    expect(cols.languageId).toBeDefined();
  });

  it('defines refresh_tokens and password_reset_tokens for secure session & recovery', () => {
    const refreshCols = getTableColumns(refreshTokens);
    expect(refreshCols.userId).toBeDefined();
    expect(refreshCols.tokenHash).toBeDefined();
    expect(refreshCols.expiresAt).toBeDefined();
    expect(refreshCols.revokedAt).toBeDefined();

    const resetCols = getTableColumns(passwordResetTokens);
    expect(resetCols.userId).toBeDefined();
    expect(resetCols.tokenHash).toBeDefined();
    expect(resetCols.expiresAt).toBeDefined();
    expect(resetCols.usedAt).toBeDefined();
  });

  it('defines courses and speech drill exercise hierarchy', () => {
    const courseCols = getTableColumns(courses);
    expect(courseCols.title).toBeDefined();
    expect(courseCols.targetLanguage).toBeDefined();
    expect(courseCols.level).toBeDefined();

    const lessonCols = getTableColumns(lessons);
    expect(lessonCols.courseId).toBeDefined();
    expect(lessonCols.orderIndex).toBeDefined();

    const exerciseCols = getTableColumns(exercises);
    expect(exerciseCols.type).toBeDefined();
    expect(exerciseCols.promptText).toBeDefined();
    expect(exerciseCols.targetPhonemes).toBeDefined();
  });

  it('defines audio submission and AI evaluation tables', () => {
    const subCols = getTableColumns(submissions);
    expect(subCols.audioStorageKey).toBeDefined();
    expect(subCols.status).toBeDefined();

    const evalCols = getTableColumns(evaluations);
    expect(evalCols.submissionId).toBeDefined();
    expect(evalCols.overallScore).toBeDefined();
    expect(evalCols.wordsJson).toBeDefined();
    expect(evalCols.pedagogicalFeedback).toBeDefined();
  });
});
