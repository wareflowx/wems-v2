import { useSyncExternalStore } from "react";
import { ipc } from "@@/ipc/manager";

// Store for external sync - holds the current ready state
let currentReady = false;
let listeners: (() => void)[] = [];

// Subscribe to IPC ready changes
function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

// Get current snapshot
function getSnapshot(): boolean {
  return currentReady;
}

// Get server snapshot (for SSR - not used in Electron but required)
function getServerSnapshot(): boolean {
  return false;
}

// Initialize the subscription to IPC ready state
function initORPCReadyListener() {
  ipc.onReadyChange((ready) => {
    currentReady = ready;
    listeners.forEach((listener) => listener());
  });
}

// Call once to set up the listener
initORPCReadyListener();

/**
 * Hook to check if ORPC is ready
 * Use this with TanStack Query's `enabled` option to wait for ORPC before fetching
 *
 * @example
 * ```ts
 * const orpcReady = useORPCReady();
 *
 * const { data } = useQuery({
 *   queryKey: ['employees'],
 *   queryFn: getEmployees,
 *   enabled: orpcReady, // Only fetch when ORPC is ready
 * });
 * ```
 */
export function useORPCReady(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
