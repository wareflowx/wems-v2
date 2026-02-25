import { os } from "@orpc/server";
import type { BrowserWindow } from "electron";

class IPCContext {
  mainWindow: BrowserWindow | undefined;

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  get mainWindowContext() {
    const window = this.mainWindow;

    // Return a no-op middleware if window isn't set yet
    // Handlers should handle the case where context.window is undefined
    if (!window) {
      return os.middleware(({ next }) =>
        next({ context: { window: undefined } })
      );
    }

    return os.middleware(({ next }) =>
      next({
        context: {
          window,
        },
      })
    );
  }
}

export const ipcContext = new IPCContext();
