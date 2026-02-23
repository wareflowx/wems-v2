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
    if (this.initialized) {
      return;
    }

    this.clientPort.start();

    // Send server port to main process
    window.postMessage(IPC_CHANNELS.START_ORPC_SERVER, "*", [this.serverPort]);
    this.initialized = true;

    // Create a promise that resolves when main process confirms ready
    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });
  }

  // Wait for ORPC to be ready before making calls
  async waitForReady(): Promise<void> {
    if (this.ready) {
      return;
    }

    // If already initialized but not ready yet, wait for it
    if (this.readyPromise) {
      await this.readyPromise;
    }
  }

  isReady(): boolean {
    return this.ready;
  }
}

export const ipc = new IPCManager();
ipc.initialize();
