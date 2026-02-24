export const LOCAL_STORAGE_KEYS = {
  LANGUAGE: "lang",
  THEME: "theme",
};

// ORPC IPC Channels - following ORPC best practices
export const IPC_CHANNELS = {
  // Main process tells renderer it's ready
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
} as const;
