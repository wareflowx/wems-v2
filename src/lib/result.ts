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

export type ResultType<T, E = Error> = Success<T> | Failure<E>;

/**
 * Type guard for narrowing ResultType to Success.
 * Returns true if result is Success, enabling TypeScript narrowing.
 */
export function isSuccess<T, E>(result: ResultType<T, E>): result is Success<T> {
  return result._tag === 'Success';
}

/**
 * Type guard for narrowing ResultType to Failure.
 * Returns true if result is Failure, enabling TypeScript narrowing.
 */
export function isFailure<T, E>(result: ResultType<T, E>): result is Failure<E> {
  return result._tag === 'Failure';
}

/**
 * Transform the success value
 */
export function map<T, E, U>(
  result: ResultType<T, E>,
  fn: (value: T) => U
): ResultType<U, E> {
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
  result: ResultType<T, E>,
  fn: (error: E) => F
): ResultType<T, F> {
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
export function unwrapOr<T, E>(result: ResultType<T, E>, defaultValue: T): T {
  switch (result._tag) {
    case 'Success':
      return result.value;
    case 'Failure':
      return defaultValue;
  }
}

/**
 * Async: Transform the success value
 */
export async function mapAsync<T, E, U>(
  result: ResultType<T, E>,
  fn: (value: T) => Promise<U> | U
): Promise<ResultType<U, E>> {
  switch (result._tag) {
    case 'Success':
      return { _tag: 'Success', value: await fn(result.value) };
    case 'Failure':
      return result;
  }
}

/**
 * Async: Transform the error value
 */
export async function mapErrorAsync<T, E, F>(
  result: ResultType<T, E>,
  fn: (error: E) => Promise<F> | F
): Promise<ResultType<T, F>> {
  switch (result._tag) {
    case 'Success':
      return result;
    case 'Failure':
      return { _tag: 'Failure', error: await fn(result.error) };
  }
}

/**
 * Async: Chain operations that return Result
 */
export async function flatMapAsync<T, E, U>(
  result: ResultType<T, E>,
  fn: (value: T) => Promise<ResultType<U, E>> | ResultType<U, E>
): Promise<ResultType<U, E>> {
  switch (result._tag) {
    case 'Success':
      return fn(result.value);
    case 'Failure':
      return result;
  }
}

/**
 * Factory functions for creating Result instances
 */
export const Result = {
  /**
   * Create a success result
   */
  success: <T, E = Error>(value: T): ResultType<T, E> => ({
    _tag: 'Success',
    value,
  }),

  /**
   * Create a failure result
   */
  failure: <T, E = Error>(error: E): ResultType<T, E> => ({
    _tag: 'Failure',
    error,
  }),

  /**
   * Pattern match on Result - both callbacks required
   * Includes exhaustiveness checking for compile-time safety
   */
  match: <T, E, R>(
    result: ResultType<T, E>,
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
    result: ResultType<T, E>,
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

// Backward compatibility type alias
export type { ResultType as Result };
