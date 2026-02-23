/**
 * Result type for explicit error handling
 * Provides a functional approach to handling success/failure states
 *
 * Uses discriminated union with _tag for proper TypeScript narrowing.
 * Unlike Rust's Result.isOk() which returns a boolean, we use type guards
 * (isSuccess/isFailure) for compile-time type narrowing. This enables
 * exhaustiveness checking and better IDE support.
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

/**
 * Type guard for narrowing Result to Success.
 * Returns true if result is Success, enabling TypeScript narrowing.
 */
export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result._tag === 'Success';
}

/**
 * Type guard for narrowing Result to Failure.
 * Returns true if result is Failure, enabling TypeScript narrowing.
 */
export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result._tag === 'Failure';
}

/**
 * Transform the success value
 */
export function map<T, E, U>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  switch (result._tag) {
    case 'Success':
      return { _tag: 'Success', value: fn(result.value) };
    case 'Failure':
      return result;
  }
}

/**
 * Transform the error value
 */
export function mapError<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  switch (result._tag) {
    case 'Success':
      return result;
    case 'Failure':
      return { _tag: 'Failure', error: fn(result.error) };
  }
}

/**
 * Get the success value or a default
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  switch (result._tag) {
    case 'Success':
      return result.value;
    case 'Failure':
      return defaultValue;
  }
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
   * Pattern match on Result - both callbacks required
   * Includes exhaustiveness checking for compile-time safety
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
      default: {
        // Exhaustiveness check - TypeScript will error if a case is not handled
        const _exhaustive: never = result;
        throw new Error(`Unreachable: ${_exhaustive}`);
      }
    }
  },

  /**
   * Pattern match on Result - both callbacks optional
   */
  matchOpt: <T, E, R>(
    result: Result<T, E>,
    config?: {
      onSuccess?: (value: T) => R;
      onFailure?: (error: E) => R;
    }
  ): R | undefined => {
    switch (result._tag) {
      case 'Success':
        return config?.onSuccess?.(result.value);
      case 'Failure':
        return config?.onFailure?.(result.error);
      default: {
        const _exhaustive: never = result;
        return undefined;
      }
    }
  },
};
