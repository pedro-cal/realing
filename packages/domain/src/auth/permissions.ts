import type { RoleName, RoleAssignment } from '@repo/contracts';

export const Permissions = {
  // Course Management
  COURSE_CREATE: 'course:create',
  COURSE_EDIT: 'course:edit',
  COURSE_DELETE: 'course:delete',
  COURSE_PUBLISH: 'course:publish',

  // Learning & Lessons
  LESSON_ATTEND: 'lesson:attend',
  EXERCISE_SUBMIT: 'exercise:submit',
  AUDIO_PLAY_REFERENCE: 'audio:play_reference',

  // Teaching & Mentoring
  SUBMISSION_GRADE: 'submission:grade',
  FEEDBACK_RECORD: 'feedback:record',
  STUDENT_MENTOR: 'student:mentor',

  // Community & Social Moderation
  AUDIO_MODERATE: 'audio:moderate',
  USER_MUTE: 'user:mute',
  ROOM_MODERATE: 'room:moderate',
  MESSAGE_DELETE: 'message:delete',

  // Platform Administration
  SYSTEM_ADMIN: 'system:admin',
  USER_MANAGE: 'user:manage',
  METRICS_VIEW: 'metrics:view',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

/**
 * Standard baseline permissions assigned to each role.
 */
export const RolePermissionMatrix: Record<RoleName, readonly Permission[]> = {
  admin: Object.values(Permissions),

  course_creator: [
    Permissions.COURSE_CREATE,
    Permissions.COURSE_EDIT,
    Permissions.COURSE_DELETE,
    Permissions.COURSE_PUBLISH,
    Permissions.LESSON_ATTEND,
    Permissions.AUDIO_PLAY_REFERENCE,
  ],

  teacher: [
    Permissions.LESSON_ATTEND,
    Permissions.AUDIO_PLAY_REFERENCE,
    Permissions.SUBMISSION_GRADE,
    Permissions.FEEDBACK_RECORD,
    Permissions.STUDENT_MENTOR,
  ],

  monitor: [
    Permissions.LESSON_ATTEND,
    Permissions.AUDIO_PLAY_REFERENCE,
    Permissions.AUDIO_MODERATE,
    Permissions.USER_MUTE,
    Permissions.ROOM_MODERATE,
    Permissions.MESSAGE_DELETE,
  ],

  student: [
    Permissions.LESSON_ATTEND,
    Permissions.EXERCISE_SUBMIT,
    Permissions.AUDIO_PLAY_REFERENCE,
  ],
};

export interface PermissionEvaluationContext {
  courseId?: string;
  languageId?: string;
}

/**
 * Computes the union of all effective permissions from multiple accumulated roles,
 * taking into consideration global roles and contextual/scoped role assignments.
 */
export function computeEffectivePermissions(
  assignments: readonly RoleAssignment[],
  context?: PermissionEvaluationContext
): Set<Permission> {
  const effective = new Set<Permission>();

  for (const assignment of assignments) {
    const rolePermissions = RolePermissionMatrix[assignment.role];
    if (!rolePermissions) continue;

    // Check if the assignment is global (no course/language scope restriction)
    const hasScope = Boolean(assignment.scope?.courseId || assignment.scope?.languageId);

    if (!hasScope) {
      // Global role: grants permissions universally
      for (const perm of rolePermissions) {
        effective.add(perm);
      }
      continue;
    }

    // Scoped role: grants permissions if the request matches the role's scope
    const matchesCourse =
      !assignment.scope?.courseId || assignment.scope.courseId === context?.courseId;
    const matchesLanguage =
      !assignment.scope?.languageId || assignment.scope.languageId === context?.languageId;

    if (matchesCourse && matchesLanguage) {
      for (const perm of rolePermissions) {
        effective.add(perm);
      }
    }
  }

  return effective;
}

/**
 * Convenience helper to verify if an accumulated set of roles satisfies a required permission.
 */
export function hasPermission(
  assignments: readonly RoleAssignment[],
  requiredPermission: Permission,
  context?: PermissionEvaluationContext
): boolean {
  const effective = computeEffectivePermissions(assignments, context);
  return effective.has(requiredPermission) || effective.has(Permissions.SYSTEM_ADMIN);
}
