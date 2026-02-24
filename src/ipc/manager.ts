import { type ClientContext, createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/message-port";
import type { RouterClient } from "@orpc/server";
import { IPC_CHANNELS } from "@/constants";
import type { router } from "./router";

type RPCClient = RouterClient<typeof router>;

class IPCManager {
  private rpcLink: RPCLink<ClientContext> | null = null;
  private _client: RPCClient | null = null;

  private initialized = false;
  private ready = false;
  private readyPromise: Promise<void> | null = null;
  private resolveReady: (() => void) | null = null;

  get client(): RPCClient {
    if (!this._client) {
      throw new Error(
        "ORPC client not initialized. " +
        "Call ipc.waitForReady() first, or ensure preload triggers " +
        "window.notifyRendererReady() on load."
      );
    }
    return this._client;
  }

  constructor() {
    // Try to get port from preload via callback
    const globalWindow = window as unknown as {
      onORPCPortReady?: (callback: (port: MessagePort) => void) => void;
    };

    if (globalWindow.onORPCPortReady) {
      console.log("[IPC] Registering onORPCPortReady callback...");
      globalWindow.onORPCPortReady((port) => {
        console.log("[IPC] onORPCPortReady callback fired!");
        this.initWithPort(port);
      });
    } else {
      console.log("[IPC] onORPCPortReady not available yet");
    }

    // Also check global __orpcPort as fallback
    const globalWithPort = window as unknown as { __orpcPort?: MessagePort };
    if (globalWithPort.__orpcPort) {
      console.log("[IPC] Port already available from global!");
      this.initWithPort(globalWithPort.__orpcPort);
    }
  }

  private initWithPort(port: MessagePort) {
    console.log("[IPC] initWithPort called");
    console.log("[IPC] port.constructor:", port.constructor?.name);
    console.log("[IPC] typeof port.addEventListener:", typeof port.addEventListener);

    try {
      this.rpcLink = new RPCLink({ port });
      console.log("[IPC] RPCLink created!");
      this._client = createORPCClient(this.rpcLink);
      console.log("[IPC] Client created!");
      this.ready = true;
      if (this.resolveReady) {
        this.resolveReady();
      }
    } catch (error) {
      console.error("[IPC] Error creating RPCLink:", error);
    }
  }

  async waitForReady(): Promise<void> {
    if (this.ready) {
      return;
    }

    // If not initialized, initialize first
    if (!this.initialized) {
      this.initialize();
    }

    // If we already have the port (arrived via postMessage), we're done
    if (this.ready) {
      return;
    }

    // Port not yet available - notify main and wait
    const globalWindow = window as unknown as {
      waitForMainReady?: () => Promise<void>;
      notifyRendererReady?: () => void;
    };

    // Try to wait for main ready, but don't block if it's not available yet
    if (globalWindow.waitForMainReady) {
      console.log("[IPC] waitForReady: waiting for main ready...");
      try {
        // Add a timeout so we don't wait forever
        await Promise.race([
          globalWindow.waitForMainReady(),
          new Promise((resolve) => setTimeout(resolve, 3000))
        ]);
        console.log("[IPC] waitForReady: main ready, notifying main...");
        globalWindow.notifyRendererReady?.();
      } catch (error) {
        console.log("[IPC] waitForReady: waitForMainReady failed or timed out, still notifying...");
        globalWindow.notifyRendererReady?.();
      }
    } else {
      // Main ready function not available yet, try anyway
      console.log("[IPC] waitForReady: waitForMainReady not available, notifying anyway...");
      globalWindow.notifyRendererReady?.();
    }

    // Now wait for the port to arrive via postMessage
    console.log("[IPC] waitForReady: waiting for port via postMessage...");
    if (this.readyPromise) {
      await this.readyPromise;
    }
    console.log("[IPC] waitForReady: done");
  }

  initialize() {
    console.log("[IPC] initialize called, initialized:", this.initialized);
    if (this.initialized) {
      console.log("[IPC] initialize: already initialized, returning");
      return;
    }

    this.initialized = true;

    // Create a promise that resolves when main process confirms ready
    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });
  }

  isReady(): boolean {
    return this.ready;
  }
}

export const ipc = new IPCManager();
