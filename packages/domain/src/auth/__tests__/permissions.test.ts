import { describe, it, expect } from 'vitest';
import {
  Permissions,
  computeEffectivePermissions,
  hasPermission,
  transitionExerciseState,
  ExerciseSubmissionStates,
  type ExerciseMachineContext,
} from '../../index';
import type { RoleAssignment } from '@repo/contracts';

describe('Cumulative PBAC Permission Engine', () => {
  it('grants basic learning permissions to a student role', () => {
    const roles: RoleAssignment[] = [{ role: 'student' }];
    const permissions = computeEffectivePermissions(roles);

    expect(permissions.has(Permissions.LESSON_ATTEND)).toBe(true);
    expect(permissions.has(Permissions.EXERCISE_SUBMIT)).toBe(true);
    expect(permissions.has(Permissions.SUBMISSION_GRADE)).toBe(false);
    expect(permissions.has(Permissions.COURSE_CREATE)).toBe(false);
  });

  it('accumulates permissions when a user is both Teacher and Student', () => {
    const roles: RoleAssignment[] = [
      { role: 'student' },
      { role: 'teacher' },
    ];
    const permissions = computeEffectivePermissions(roles);

    // From student:
    expect(permissions.has(Permissions.EXERCISE_SUBMIT)).toBe(true);
    // From teacher:
    expect(permissions.has(Permissions.SUBMISSION_GRADE)).toBe(true);
    expect(permissions.has(Permissions.FEEDBACK_RECORD)).toBe(true);
    // Still neither:
    expect(permissions.has(Permissions.COURSE_CREATE)).toBe(false);
  });

  it('accumulates permissions for Course Creator + Monitor', () => {
    const roles: RoleAssignment[] = [
      { role: 'course_creator' },
      { role: 'monitor' },
    ];
    const permissions = computeEffectivePermissions(roles);

    // From course_creator:
    expect(permissions.has(Permissions.COURSE_CREATE)).toBe(true);
    expect(permissions.has(Permissions.COURSE_PUBLISH)).toBe(true);
    // From monitor:
    expect(permissions.has(Permissions.AUDIO_MODERATE)).toBe(true);
    expect(permissions.has(Permissions.USER_MUTE)).toBe(true);
  });

  it('respects course-specific scoped role assignments', () => {
    const courseA = '11111111-1111-1111-1111-111111111111';
    const courseB = '22222222-2222-2222-2222-222222222222';

    const roles: RoleAssignment[] = [
      { role: 'teacher', scope: { courseId: courseA } },
      { role: 'student', scope: { courseId: courseB } },
    ];

    // Check in context of Course A:
    expect(hasPermission(roles, Permissions.SUBMISSION_GRADE, { courseId: courseA })).toBe(true);
    expect(hasPermission(roles, Permissions.EXERCISE_SUBMIT, { courseId: courseA })).toBe(false);

    // Check in context of Course B:
    expect(hasPermission(roles, Permissions.SUBMISSION_GRADE, { courseId: courseB })).toBe(false);
    expect(hasPermission(roles, Permissions.EXERCISE_SUBMIT, { courseId: courseB })).toBe(true);
  });

  it('allows Admin to bypass all permission checks via SYSTEM_ADMIN', () => {
    const roles: RoleAssignment[] = [{ role: 'admin' }];
    expect(hasPermission(roles, Permissions.COURSE_CREATE)).toBe(true);
    expect(hasPermission(roles, Permissions.AUDIO_MODERATE)).toBe(true);
    expect(hasPermission(roles, Permissions.SYSTEM_ADMIN)).toBe(true);
  });
});

describe('Exercise State Machine', () => {
  it('handles standard successful recording to evaluation lifecycle', () => {
    let ctx: ExerciseMachineContext = { state: ExerciseSubmissionStates.IDLE };

    ctx = transitionExerciseState(ctx, { type: 'START_RECORDING' });
    expect(ctx.state).toBe(ExerciseSubmissionStates.RECORDING);

    ctx = transitionExerciseState(ctx, {
      type: 'START_UPLOAD',
      audioId: 'audio-uuid-123',
    });
    expect(ctx.state).toBe(ExerciseSubmissionStates.UPLOADING);
    expect(ctx.audioId).toBe('audio-uuid-123');

    ctx = transitionExerciseState(ctx, { type: 'UPLOAD_SUCCESS' });
    expect(ctx.state).toBe(ExerciseSubmissionStates.PROCESSING);

    ctx = transitionExerciseState(ctx, {
      type: 'EVALUATION_COMPLETED',
      reportId: 'report-uuid-456',
    });
    expect(ctx.state).toBe(ExerciseSubmissionStates.COMPLETED);
    expect(ctx.reportId).toBe('report-uuid-456');
  });

  it('handles upload failure gracefully', () => {
    let ctx: ExerciseMachineContext = { state: ExerciseSubmissionStates.UPLOADING, audioId: 'audio-uuid-123' };

    ctx = transitionExerciseState(ctx, {
      type: 'UPLOAD_FAILED',
      error: 'Network connection lost during upload',
    });
    expect(ctx.state).toBe(ExerciseSubmissionStates.FAILED);
    expect(ctx.error).toContain('Network connection');
  });
});
