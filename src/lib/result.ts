/**
 * Result type for explicit error handling
 * Provides a functional approach to handling success/failure states
 */

export type Result<T, E = Error> =
  | {
      ok: true;
      value: T;
      isSuccess: () => true;
      isFailure: () => false;
      match: <R>(config: {
        onSuccess: (value: T) => R;
        onFailure: (error: E) => R;
      }) => R;
    }
  | {
      ok: false;
      error: E;
      isSuccess: () => false;
      isFailure: () => true;
      match: <R>(config: {
        onSuccess: (value: T) => R;
        onFailure: (error: E) => R;
      }) => R;
    };

/**
 * Factory functions for creating Result instances
 */
export const Result = {
  /**
   * Create a success result
   */
  success: <T, E = Error>(value: T): Result<T, E> => ({
    ok: true,
    value,
    isSuccess: () => true,
    isFailure: () => false,
    match: ({ onSuccess }) => onSuccess(value),
  }),

  /**
   * Create a failure result
   */
  failure: <T, E = Error>(error: E): Result<T, E> => ({
    ok: false,
    error,
    isSuccess: () => false,
    isFailure: () => true,
    match: ({ onFailure }) => onFailure(error),
  }),
};
