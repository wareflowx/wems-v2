/**
 * Result type for explicit error handling
 * Provides a functional approach to handling success/failure states
 */

export type Success<T> = {
  readonly _tag: 'Success';
  readonly value: T;
};

export type Failure<E> = {
  readonly _tag: 'Failure';
  readonly error: E;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;

export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result._tag === 'Success';
}

export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result._tag === 'Failure';
}

/**
 * Factory functions for creating Result instances
 */
export const Result = {
  /**
   * Create a success result
   */
  success: <T, E = Error>(value: T): Result<T, E> => ({
    _tag: 'Success',
    value,
  }),

  /**
   * Create a failure result
   */
  failure: <T, E = Error>(error: E): Result<T, E> => ({
    _tag: 'Failure',
    error,
  }),

  /**
   * Pattern match on Result
   */
  match: <T, E, R>(
    result: Result<T, E>,
    config: {
      onSuccess: (value: T) => R;
      onFailure: (error: E) => R;
    }
  ): R => {
    switch (result._tag) {
      case 'Success':
        return config.onSuccess(result.value);
      case 'Failure':
        return config.onFailure(result.error);
    }
  },
};
