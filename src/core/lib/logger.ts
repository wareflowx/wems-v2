/**
 * Professional logging module with context support and configurable log levels
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: string;
  error?: Error;
}

export type LoggerConfig = Partial<Record<string, LogLevel>>;

type LogMethod = (message: string, context?: string) => void;
type ErrorLogMethod = (
  message: string,
  error?: Error,
  context?: string
) => void;

// Log level priority (lower = more verbose)
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Default configuration
let globalConfig: LoggerConfig = {
  default: "info",
};

// Get the effective log level for a context
function getLogLevel(context?: string): LogLevel {
  const level = context ? globalConfig[context] : globalConfig.default;
  return level ?? "info";
}

// Check if a message should be logged
function shouldLog(level: LogLevel, context?: string): boolean {
  const contextLevel = getLogLevel(context);
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[contextLevel];
}

// Format timestamp
function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

// Output to console
function output(entry: LogEntry): void {
  const timestamp = formatTimestamp(entry.timestamp);
  const context = entry.context ? `[${entry.context}]` : "";
  const errorInfo = entry.error
    ? `\n${entry.error.stack ?? "(no stack trace available)"}`
    : "";

  const message = `${timestamp} ${context} ${entry.message}${errorInfo}`;

  // Map log levels to console methods
  const logMethods: Record<LogLevel, "debug" | "info" | "warn" | "error"> = {
    debug: "debug",
    info: "info",
    warn: "warn",
    error: "error",
  };

  console[logMethods[entry.level]](message);
}

// Create a log entry
function createEntry(
  level: LogLevel,
  message: string,
  context?: string,
  error?: Error
): LogEntry {
  return {
    level,
    message,
    timestamp: Date.now(),
    context,
    error,
  };
}

/**
 * Configure the logger with per-context log levels
 * @param config - Object mapping context names to log levels
 * @returns A configured logger instance
 */
export function configure(config: LoggerConfig): {
  debug: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: ErrorLogMethod;
} {
  globalConfig = { ...globalConfig, ...config };

  return {
    debug: (message: string, context?: string) => {
      if (shouldLog("debug", context)) {
        output(createEntry("debug", message, context));
      }
    },

    info: (message: string, context?: string) => {
      if (shouldLog("info", context)) {
        output(createEntry("info", message, context));
      }
    },

    warn: (message: string, context?: string) => {
      if (shouldLog("warn", context)) {
        output(createEntry("warn", message, context));
      }
    },

    error: (message: string, error?: Error, context?: string) => {
      if (shouldLog("error", context)) {
        output(createEntry("error", message, context, error));
      }
    },
  };
}

/**
 * Get current configuration
 */
export function getConfig(): LoggerConfig {
  return { ...globalConfig };
}

/**
 * Reset configuration to defaults
 */
export function reset(): void {
  globalConfig = { default: "info" };
}

// Pre-configured default logger
export const logger = configure({
  default: "info",
});
