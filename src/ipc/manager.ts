import { type ClientContext, createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/message-port";
import type { RouterClient } from "@orpc/server";
import { IPC_CHANNELS } from "@/constants";
import type { router } from "./router";

type RPCClient = RouterClient<typeof router>;

class IPCManager {
  private readonly clientPort: MessagePort;
  private readonly serverPort: MessagePort;

  private readonly rpcLink: RPCLink<ClientContext>;

  private initialized = false;
  private ready = false;
  private readyPromise: Promise<void> | null = null;
  private resolveReady: (() => void) | null = null;

  readonly client: RPCClient;

  constructor() {
    const { port1: clientChannelPort, port2: serverChannelPort } =
      new MessageChannel();
    this.clientPort = clientChannelPort;
    this.serverPort = serverChannelPort;

    this.rpcLink = new RPCLink({
      port: this.clientPort,
    });
    this.client = createORPCClient(this.rpcLink);

    // Wait for onMainReady to be available, then register callback
    const setupCallback = () => {
      const globalWindow = window as unknown as {
        onMainReady?: (callback: () => void) => void;
        notifyRendererReady?: () => void;
      };

      if (globalWindow.onMainReady) {
        console.log("[IPC] Registering onMainReady callback");
        globalWindow.onMainReady(() => {
          console.log("[IPC] onMainReady callback fired!");
          // Notify main that renderer is ready
          globalWindow.notifyRendererReady?.();
        });
      } else {
        // Try again in 100ms
        setTimeout(setupCallback, 100);
      }
    };

    // Start trying to register callback
    setTimeout(setupCallback, 0);

    // Listen for ORPC_READY with the port from main
    window.addEventListener("message", (event) => {
      console.log("[IPC] Received message:", event.data);
      if (event.data === IPC_CHANNELS.ORPC_READY && event.ports[0]) {
        console.log("[IPC] ORPC_READY received with port!");
        const port = event.ports[0];
        // Replace the client port with the one from main
        this.rpcLink.setPort(port);
        port.start();
        this.ready = true;
        if (this.resolveReady) {
          this.resolveReady();
        }
      }
    });
  }

  initialize() {
    console.log("[IPC] initialize called, initialized:", this.initialized);
    if (this.initialized) {
      console.log("[IPC] initialize: already initialized, returning");
      return;
    }

    console.log("[IPC] initialize: starting clientPort and sending START_ORPC_SERVER");
    this.clientPort.start();

    // Send server port to main process
    try {
      window.postMessage(IPC_CHANNELS.START_ORPC_SERVER, "*", [this.serverPort]);
      console.log("[IPC] initialize: message sent");
    } catch (error) {
      console.error("[IPC] initialize: postMessage failed:", error);
    }
    this.initialized = true;

    // Create a promise that resolves when main process confirms ready
    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });
  }

  // Wait for ORPC to be ready before making calls
  async waitForReady(): Promise<void> {
    console.log("[IPC] waitForReady called, ready:", this.ready, "initialized:", this.initialized);
    if (this.ready) {
      console.log("[IPC] waitForReady: already ready, returning");
      return;
    }

    // If not initialized yet, wait for MAIN_READY first
    if (!this.initialized) {
      console.log("[IPC] waitForReady: not initialized, waiting for MAIN_READY...");
      // Wait for MAIN_READY signal (this happens in constructor via event listener)
      // We need to create a promise that resolves when initialized
      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          if (this.initialized) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      });
      console.log("[IPC] waitForReady: now initialized, checking readyPromise...");
    }

    // If already initialized but not ready yet, wait for it
    if (this.readyPromise) {
      console.log("[IPC] waitForReady: waiting for readyPromise...");
      await this.readyPromise;
      console.log("[IPC] waitForReady: promise resolved");
    } else {
      console.log("[IPC] waitForReady: NO readyPromise, this is a problem!");
    }
  }

  isReady(): boolean {
    return this.ready;
  }
}

export const ipc = new IPCManager();
