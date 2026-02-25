import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/message-port";
import type { RouterClient } from "@orpc/server";
import type { router } from "./router";

type RPCClient = RouterClient<typeof router>;

// Type definitions for the preload API
interface ElectronAPI {
  rpc: {
    notifyReady: () => void;
  };
}

class IPCManager {
  private _client: RPCClient | null = null;
  private _initialized = false;
  private _readyResolve: (() => void) | null = null;
  private _readyPromise: Promise<void> | null = null;
  private _readyListeners: ((ready: boolean) => void)[] = [];

  /**
   * Initialize the IPC connection - call this once at app startup
   * Best Practice: Event-driven approach - renderer gets port directly via postMessage
   */
  init(): void {
    if (this._initialized) {
      return;
    }
    this._initialized = true;

    console.log("[IPC] Initializing ORPC...");

    // Create promise that resolves when client is ready
    this._readyPromise = new Promise((resolve) => {
      this._readyResolve = resolve;
    });

    // Listen for port from preload via window.postMessage
    // This is the CORRECT way - port is transferred directly, not through contextBridge
    window.addEventListener("message", (event) => {
      if (event.data?.type === "orpc-port-ready") {
        const [port] = event.ports;
        if (port) {
          console.log("[IPC] Port received via postMessage!");
          this._handlePort(port);
        }
      }
    });

    // Poll for ORPC ready as fallback (handles race condition where message might be missed)
    this._pollForReady();

    // Notify main that we're ready to receive the port
    const api = (window as unknown as { electron?: ElectronAPI }).electron;
    if (api?.rpc) {
      api.rpc.notifyReady();
      console.log("[IPC] Notified main that renderer is ready");
    } else {
      console.error("[IPC] electron.rpc not available");
    }
  }

  /**
   * Poll for ORPC ready state as a fallback mechanism
   * This handles edge cases where the message handshake might fail
   */
  private _pollForReady(): void {
    let attempts = 0;
    const maxAttempts = 50; // 50 * 100ms = 5 seconds max wait
    const pollInterval = 100;

    const checkReady = () => {
      if (this._client) {
        return; // Already ready
      }

      attempts++;
      if (attempts >= maxAttempts) {
        console.warn("[IPC] Poll timeout waiting for ORPC");
        return;
      }

      // Check if window.electron.rpc is available and re-notify if needed
      const api = (window as unknown as { electron?: ElectronAPI }).electron;
      if (api?.rpc) {
        // Already notified, just wait a bit more
        setTimeout(checkReady, pollInterval);
      } else {
        // Retry notification
        setTimeout(checkReady, pollInterval);
      }
    };

    setTimeout(checkReady, pollInterval);
  }

  private _handlePort(port: MessagePort) {
    console.log("[IPC] Creating ORPC client with port...");
    console.log("[IPC] port.constructor:", port.constructor?.name);
    console.log(
      "[IPC] typeof port.addEventListener:",
      typeof port.addEventListener
    );

    try {
      // Best Practice: Add client-side error interceptors
      const link = new RPCLink({ port });

      this._client = createORPCClient(link, {
        interceptors: [
          // Client-side error handling
          onError((error, { path }) => {
            console.error(`[ORPC Client Error] ${path}:`, error);
          }),
        ],
      });

      console.log("[IPC] ORPC Client created successfully!");
      port.start();

      // Resolve the ready promise
      if (this._readyResolve) {
        this._readyResolve();
        this._readyResolve = null;
      }

      // Notify listeners
      this._readyListeners.forEach((listener) => listener(true));
      this._readyListeners = [];
    } catch (error) {
      console.error("[IPC] Error creating RPCLink:", error);
    }
  }

  get client(): RPCClient {
    if (!this._client) {
      throw new Error(
        "ORPC client not initialized. " +
          "Call ipc.init() first in your app initialization."
      );
    }
    return this._client;
  }

  /**
   * Wait for ORPC to be ready - properly waits for the client to be initialized
   */
  async waitForReady(): Promise<void> {
    // If already ready, return immediately
    if (this._client) {
      return;
    }

    // If there's a pending promise, wait for it
    if (this._readyPromise) {
      await this._readyPromise;
      return;
    }

    // If not initialized, initialize and wait
    this.init();

    // Wait for the promise to resolve
    if (this._readyPromise) {
      await this._readyPromise;
    }
  }

  isReady(): boolean {
    return this._client !== null;
  }

  /**
   * Subscribe to ready state changes
   * Returns unsubscribe function
   */
  onReadyChange(callback: (ready: boolean) => void): () => void {
    if (this._client) {
      callback(true);
      return () => {};
    }
    this._readyListeners.push(callback);
    return () => {
      this._readyListeners = this._readyListeners.filter(
        (cb) => cb !== callback
      );
    };
  }
}

export const ipc = new IPCManager();
