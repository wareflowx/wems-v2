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
      throw new Error("ORPC client not initialized. Call waitForReady() first.");
    }
    return this._client;
  }

  constructor() {
    // Register callback for ORPC ready via preload
    const globalWindow = window as unknown as {
      onORPCReady?: (callback: (port: MessagePort) => void) => void;
    };

    if (globalWindow.onORPCReady) {
      console.log("[IPC] Registering onORPCReady callback");
      globalWindow.onORPCReady((port) => {
        console.log("[IPC] ORPC_READY received with port!");
        console.log("[IPC] port:", port);
        console.log("[IPC] port.constructor:", port.constructor?.name);
        console.log("[IPC] 'addEventListener' in port:", "addEventListener" in port);
        console.log("[IPC] typeof port.addEventListener:", typeof port.addEventListener);

        // Create the RPCLink with the port from main
        console.log("[IPC] Creating RPCLink...");
        this.rpcLink = new RPCLink({ port });
        console.log("[IPC] RPCLink created!");
        this._client = createORPCClient(this.rpcLink);
        console.log("[IPC] Client created!");
        port.start();
        this.ready = true;
        if (this.resolveReady) {
          this.resolveReady();
        }
      });
    } else {
      console.log("[IPC] onORPCReady not available yet, will be registered later");
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

    // Wait for main to be ready first
    const globalWindow = window as unknown as {
      waitForMainReady?: () => Promise<void>;
      notifyRendererReady?: () => void;
    };

    if (globalWindow.waitForMainReady) {
      console.log("[IPC] waitForReady: waiting for main ready...");
      await globalWindow.waitForMainReady();
      console.log("[IPC] waitForReady: main ready, notifying main...");

      // Now notify main that renderer is ready
      globalWindow.notifyRendererReady?.();
    }

    // Then wait for ORPC to be set up
    if (this.readyPromise) {
      console.log("[IPC] waitForReady: waiting for readyPromise...");
      await this.readyPromise;
      console.log("[IPC] waitForReady: promise resolved");
    }
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
