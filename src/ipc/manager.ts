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

    // Set up listener for when ORPC is ready
    window.addEventListener("message", (event) => {
      if (event.data === IPC_CHANNELS.ORPC_READY) {
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
    window.postMessage(IPC_CHANNELS.START_ORPC_SERVER, "*", [this.serverPort]);
    console.log("[IPC] initialize: message sent");
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
ipc.initialize();
