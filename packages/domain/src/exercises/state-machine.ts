export const ExerciseSubmissionStates = {
  IDLE: 'IDLE',
  RECORDING: 'RECORDING',
  UPLOADING: 'UPLOADING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type ExerciseSubmissionState =
  (typeof ExerciseSubmissionStates)[keyof typeof ExerciseSubmissionStates];

export type ExerciseEvent =
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING'; durationSeconds: number }
  | { type: 'START_UPLOAD'; audioId: string }
  | { type: 'UPLOAD_SUCCESS' }
  | { type: 'UPLOAD_FAILED'; error: string }
  | { type: 'EVALUATION_COMPLETED'; reportId: string }
  | { type: 'EVALUATION_FAILED'; error: string }
  | { type: 'RESET' };

export interface ExerciseMachineContext {
  state: ExerciseSubmissionState;
  audioId?: string;
  durationSeconds?: number;
  reportId?: string;
  error?: string;
}

export function transitionExerciseState(
  current: ExerciseMachineContext,
  event: ExerciseEvent
): ExerciseMachineContext {
  switch (current.state) {
    case ExerciseSubmissionStates.IDLE:
      if (event.type === 'START_RECORDING') {
        return { state: ExerciseSubmissionStates.RECORDING };
      }
      break;

    case ExerciseSubmissionStates.RECORDING:
      if (event.type === 'STOP_RECORDING') {
        return {
          state: ExerciseSubmissionStates.IDLE,
          durationSeconds: event.durationSeconds,
        };
      }
      if (event.type === 'START_UPLOAD') {
        return {
          state: ExerciseSubmissionStates.UPLOADING,
          audioId: event.audioId,
        };
      }
      break;

    case ExerciseSubmissionStates.UPLOADING:
      if (event.type === 'UPLOAD_SUCCESS') {
        return { ...current, state: ExerciseSubmissionStates.PROCESSING };
      }
      if (event.type === 'UPLOAD_FAILED') {
        return { ...current, state: ExerciseSubmissionStates.FAILED, error: event.error };
      }
      break;

    case ExerciseSubmissionStates.PROCESSING:
      if (event.type === 'EVALUATION_COMPLETED') {
        return {
          ...current,
          state: ExerciseSubmissionStates.COMPLETED,
          reportId: event.reportId,
        };
      }
      if (event.type === 'EVALUATION_FAILED') {
        return { ...current, state: ExerciseSubmissionStates.FAILED, error: event.error };
      }
      break;

    case ExerciseSubmissionStates.COMPLETED:
    case ExerciseSubmissionStates.FAILED:
      if (event.type === 'RESET') {
        return { state: ExerciseSubmissionStates.IDLE };
      }
      break;
  }

  // If transition is invalid, retain current context
  return current;
}
