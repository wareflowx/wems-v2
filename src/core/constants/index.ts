export const LOCAL_STORAGE_KEYS = {
  LANGUAGE: "lang",
  THEME: "theme",
};

// ORPC IPC Channels - following ORPC best practices
export const IPC_CHANNELS = {
  // Main process tells renderer renderer it's ready
  MAIN_READY: "main-ready",
  // Renderer tells main it's ready to receive ORPC (best practice: single channel)
  START_ORPC_SERVER: "start-orpc-server",
  // Legacy channel names for backwards compatibility
  ORPC_READY: "orpc-ready",
  RENDERER_READY: "renderer-ready",
  // Write mode
  GET_WRITE_MODE: "get-write-mode",
  // Lock status
  LOCK_STATUS_CHANGED: "lock-status-changed",
  // Update status
  UPDATE_STATUS: "update-status",
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
} as const;

// Timeouts and intervals (in milliseconds)
export const TIMING = {
  // Lock watcher poll interval
  LOCK_WATCHER_INTERVAL_MS: 5000, // 5 seconds - reduced from 2s for better performance
  // IPC connection poll interval
  IPC_POLL_INTERVAL_MS: 100,
  // IPC max poll attempts before timeout
  IPC_MAX_POLL_ATTEMPTS: 50,
  // IPC poll timeout (IPC_POLL_INTERVAL_MS * IPC_MAX_POLL_ATTEMPTS = 5 seconds)
  IPC_POLL_TIMEOUT_MS: 5000,
  // Export preview debounce delay
  EXPORT_PREVIEW_DEBOUNCE_MS: 300,
  // Export progress simulation step interval
  EXPORT_PROGRESS_STEP_MS: 100,
  // Update status display duration before auto-clear
  UPDATE_STATUS_DISPLAY_MS: 3000,
} as const;

// Window dimensions
export const WINDOW = {
  MIN_WIDTH: 800,
  MIN_HEIGHT: 600,
} as const;

// File size limits
export const FILE_SIZES = {
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024, // 50MB
  MAX_FILE_SIZE_MB: 50,
} as const;

// String truncation limits
export const LIMITS = {
  // ISO timestamp format: "YYYY-MM-DDTHH:mm:ss"
  ISO_TIMESTAMP_LENGTH: 19,
  // Maximum number of export history entries to retain
  EXPORT_HISTORY_MAX_ENTRIES: 100,
  // Cookie max age for sidebar state (7 days in seconds)
  SIDEBAR_COOKIE_MAX_AGE: 60 * 60 * 24 * 7,
} as const;
