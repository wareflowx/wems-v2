/**
 * Lock-specific error classes
 */

export class LockAlreadyExistsError extends Error {
  constructor(public readonly lockedBy: string) {
    super(`Lock already exists by ${lockedBy}`);
    this.name = "LockAlreadyExistsError";
  }
}

export class LockFileError extends Error {
  constructor(message: string) {
    super(`Lock file error: ${message}`);
    this.name = "LockFileError";
  }
}

export class LockNotFoundError extends Error {
  constructor() {
    super("Lock not found");
    this.name = "LockNotFoundError";
  }
}
