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
    // Check if port was already received (set by renderer.ts global listener)
    const globalWindow = window as unknown as { __orpcPort?: MessagePort };
    if (globalWindow.__orpcPort) {
      console.log("[IPC] Port already available from global!");
      const port = globalWindow.__orpcPort;
      this.initWithPort(port);
      return;
    }

    // Listen for custom event from renderer.ts global listener
    window.addEventListener("orpc-port-ready", () => {
      console.log("[IPC] Received orpc-port-ready event!");
      const port = globalWindow.__orpcPort;
      if (port) {
        this.initWithPort(port);
      }
    });

    // Also listen for postMessage as fallback (for direct preload->renderer)
    window.addEventListener("message", (event) => {
      if (event.data?.type === "ORPC_PORT" && event.ports[0]) {
        const port = event.ports[0];
        console.log("[IPC] Received ORPC_PORT via postMessage!");
        this.initWithPort(port);
      }
    });
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
