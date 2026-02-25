import { EventEmitter } from "node:events";

export const lockEvents = new EventEmitter();

// Event names for lock status changes
export const LOCK_EVENTS = {
  CHANGE: "lock:change",
} as const;
