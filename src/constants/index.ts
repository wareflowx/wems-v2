export const LOCAL_STORAGE_KEYS = {
  LANGUAGE: "lang",
  THEME: "theme",
};

export const IPC_CHANNELS = {
  START_ORPC_SERVER: "start-orpc-server",
  ORPC_READY: "orpc-ready",
  MAIN_READY: "main-ready",  // Main process tells renderer it's ready to receive ORPC setup
  RENDERER_READY: "renderer-ready",  // Renderer tells main it's ready to receive ORPC
  GET_WRITE_MODE: "get-write-mode",
  LOCK_STATUS_CHANGED: "lock-status-changed",
};
