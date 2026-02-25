import fs from 'fs';
import os from 'os';
import path from 'path';
import { app } from 'electron';
import { Result, isSuccess } from '@/core/lib/result';
import { logger, configure } from '@/core/lib/logger';
import { lockEvents, LOCK_EVENTS } from '@/core/lib/lock-events';
import {
  LockAlreadyExistsError,
  LockFileError,
  LockNotFoundError,
} from './errors';

/**
 * Lock configuration
 */
export const LockConfig = {
  timeoutMs: 5 * 60 * 1000, // 5 minutes
  heartbeatIntervalMs: 30 * 1000, // 30 seconds
  fileName: '.write.lock',
} as const;

/**
 * Lock data structure
 */
export type LockData = {
  userId: string;
  hostname: string;
  timestamp: number;
  pid: number;
  lastHeartbeat: number;
};

/**
 * Internal lock state
 */
let lockData: LockData | null = null;
let lastKnownWriteMode: boolean | null = null;
let heartbeatIntervalId: ReturnType<typeof setInterval> | null = null;

function getDataDir(): string {
  // Use userData directory for data storage
  // This is the proper location for app data (writable, per-user)
  // In development: use project root for easier debugging
  const inDevelopment = process.env.NODE_ENV === 'development';
  const baseDir = inDevelopment ? process.cwd() : app.getPath('userData');
  return path.join(baseDir, 'data');
}

function ensureDataDir(): void {
  const dataDir = getDataDir();
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (error) {
      throw new LockFileError(`Cannot create data directory: ${dataDir}`);
    }
  }
}

function getLockFilePath(): string {
  return path.join(getDataDir(), LockConfig.fileName);
}

// Configure lock-specific log level
configure({ lock: 'debug' });

function readLockFile(): LockData | null {
  const lockPath = getLockFilePath();

  if (!fs.existsSync(lockPath)) {
    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
    if (Lock.isValid(data)) {
      return data;
    }
    logger.debug('Invalid lock file data structure, removing corrupted lock', 'lock');
    deleteLockFile();
    return null;
  } catch (error) {
    logger.error('Error reading lock file, removing corrupted lock', error as Error, 'lock');
    deleteLockFile();
    return null;
  }
}

function writeLockFile(data: LockData): void {
  ensureDataDir();
  const lockPath = getLockFilePath();
  fs.writeFileSync(lockPath, JSON.stringify(data));
}

function deleteLockFile(): void {
  const lockPath = getLockFilePath();
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
  }
}

function startHeartbeat(): void {
  if (heartbeatIntervalId) return;

  heartbeatIntervalId = setInterval(() => {
    Lock.updateHeartbeat();
  }, LockConfig.heartbeatIntervalMs);

  logger.debug(`Heartbeat started (interval: ${LockConfig.heartbeatIntervalMs}ms)`, 'lock');
}

function stopHeartbeat(): void {
  if (heartbeatIntervalId) {
    clearInterval(heartbeatIntervalId);
    heartbeatIntervalId = null;
    logger.debug('Heartbeat stopped', 'lock');
  }
}

// Cleanup handlers for unexpected termination
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    stopHeartbeat();
  });

  process.on('SIGTERM', () => {
    stopHeartbeat();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    stopHeartbeat();
    process.exit(0);
  });
}

/**
 * Lock module with functional approach using Result type
 */
export const Lock = {
  /**
   * Validate lock data structure
   */
  isValid(data: unknown): data is LockData {
    if (!data || typeof data !== 'object') return false;
    const obj = data as Record<string, unknown>;
    return (
      typeof obj.userId === 'string' &&
      typeof obj.hostname === 'string' &&
      typeof obj.timestamp === 'number' &&
      typeof obj.pid === 'number' &&
      typeof obj.lastHeartbeat === 'number'
    );
  },

  /**
   * Check if lock is our own (same hostname + userId).
   * Note: PID is intentionally ignored to allow multiple app instances
   * from the same user on the same machine to share write access.
   * Use lastHeartbeat to detect active vs crashed instances.
   */
  isOurLock(data: LockData): boolean {
    return (
      data.hostname === os.hostname() &&
      data.userId === os.userInfo().username
    );
  },

  /**
   * Acquire write lock
   */
  acquire: (): Result<boolean, LockAlreadyExistsError | LockFileError> => {
    try {
      const existingLock = readLockFile();

      if (existingLock) {
        const age = Date.now() - existingLock.timestamp;

        if (age < LockConfig.timeoutMs) {
          // Lock is fresh - check if it's ours
          if (Lock.isOurLock(existingLock)) {
            logger.debug('Our lock already exists, write mode enabled', 'lock');
            lockData = existingLock;
            return Result.success(true);
          }

          // Foreign lock exists
          logger.debug(`Read-only mode: ${existingLock.userId}@${existingLock.hostname} has write access`, 'lock');
          return Result.failure(
            new LockAlreadyExistsError(
              `${existingLock.userId}@${existingLock.hostname}`
            )
          );
        } else {
          // Lock is stale, remove it
          logger.debug('Removing stale write lock', 'lock');
          deleteLockFile();
        }
      }

      // Create new lock
      const newLock: LockData = {
        userId: os.userInfo().username,
        hostname: os.hostname(),
        timestamp: Date.now(),
        pid: process.pid,
        lastHeartbeat: Date.now(),
      };

      writeLockFile(newLock);
      lockData = newLock;
      logger.debug('Write lock acquired', 'lock');

      // Start heartbeat
      startHeartbeat();

      // Emit lock change event
      lockEvents.emit('change', true);

      return Result.success(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error acquiring write lock', error as Error, 'lock');
      return Result.failure(new LockFileError(message));
    }
  },

  /**
   * Release the write lock
   * Idempotent - returns success if lock doesn't exist
   */
  release: (): Result<void, LockFileError> => {
    try {
      const lockPath = getLockFilePath();

      if (!fs.existsSync(lockPath)) {
        // Already released - idempotent
        return Result.success(undefined);
      }

      // Stop heartbeat
      stopHeartbeat();

      deleteLockFile();
      lockData = null;
      logger.debug('Write lock released', 'lock');

      // Emit lock change event
      lockEvents.emit('change', false);

      return Result.success(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error releasing write lock', error as Error, 'lock');
      return Result.failure(new LockFileError(message));
    }
  },

  /**
   * Check if we currently have write access
   */
  isWriteMode: (): Result<boolean, LockFileError> => {
    try {
      const existingLock = readLockFile();

      if (!existingLock) {
        // No lock file = we can write
        return Result.success(true);
      }

      // Check if it's our lock
      if (Lock.isOurLock(existingLock)) {
        return Result.success(true);
      }

      // Check if lock is stale using lastHeartbeat (activity indicator)
      const isStale = Lock.isStale();

      // Propagate errors from isStale
      if (isStale._tag === 'Failure') {
        return Result.failure(isStale.error);
      }

      if (isStale.value) {
        return Result.success(true);
      }

      // Foreign and fresh lock = read-only
      return Result.success(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error checking write mode', error as Error, 'lock');
      return Result.failure(new LockFileError(message));
    }
  },

  /**
   * Update lastHeartbeat to indicate we are still active
   */
  updateHeartbeat: (): Result<void, LockFileError | LockNotFoundError> => {
    try {
      const existingLock = readLockFile();

      if (!existingLock) {
        return Result.failure(new LockNotFoundError());
      }

      existingLock.lastHeartbeat = Date.now();
      writeLockFile(existingLock);
      lockData = existingLock;

      return Result.success(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return Result.failure(new LockFileError(message));
    }
  },

  /**
   * Get milliseconds since lock was created
   */
  age: (): Result<number, LockFileError | LockNotFoundError> => {
    try {
      const existingLock = readLockFile();

      if (!existingLock) {
        return Result.failure(new LockNotFoundError());
      }

      return Result.success(Date.now() - existingLock.timestamp);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return Result.failure(new LockFileError(message));
    }
  },

  /**
   * Check if lock has been inactive (no heartbeat for timeout)
   */
  isStale: (): Result<boolean, LockFileError | LockNotFoundError> => {
    try {
      const existingLock = readLockFile();

      if (!existingLock) {
        return Result.failure(new LockNotFoundError());
      }

      const inactiveTime = Date.now() - existingLock.lastHeartbeat;
      return Result.success(inactiveTime >= LockConfig.timeoutMs);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return Result.failure(new LockFileError(message));
    }
  },

  /**
   * Start watching for lock changes
   */
  watch: (callback: (isWrite: boolean) => void, intervalMs: number = 2000): (() => void) => {
    // Get initial state immediately
    const initialResult = Lock.isWriteMode();
    const initialWriteMode = isSuccess(initialResult) ? initialResult.value : true;

    lastKnownWriteMode = initialWriteMode;
    callback(initialWriteMode);
    lockEvents.emit('change', initialWriteMode);

    // Check for changes periodically
    const checkLock = () => {
      const currentResult = Lock.isWriteMode();
      const currentWriteMode = isSuccess(currentResult) ? currentResult.value : true;

      if (lastKnownWriteMode !== currentWriteMode) {
        logger.debug(`Lock status changed: writeMode=${currentWriteMode}`, 'lock');
        lockEvents.emit('change', currentWriteMode);
        callback(currentWriteMode);
      }
      lastKnownWriteMode = currentWriteMode;
    };

    const intervalId = setInterval(checkLock, intervalMs);

    // Return cleanup function
    return () => clearInterval(intervalId);
  },
};
