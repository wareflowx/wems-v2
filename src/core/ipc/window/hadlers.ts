import { os } from "@orpc/server";
import { ipcContext } from "../context";

export const minimizeWindow = os
  .use(ipcContext.mainWindowContext)
  .handler(({ context }) => {
    const { window } = context;

    if (!window) {
      console.error("[MAIN] Window not available!");
      throw new Error("Window not available");
    }

    window.minimize();
  });

export const maximizeWindow = os
  .use(ipcContext.mainWindowContext)
  .handler(({ context }) => {
    const { window } = context;

    if (!window) {
      console.error("[MAIN] Window not available!");
      throw new Error("Window not available");
    }

    const isMax = window.isMaximized();
    if (isMax) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  });

export const closeWindow = os
  .use(ipcContext.mainWindowContext)
  .handler(({ context }) => {
    const { window } = context;

    if (!window) {
      console.error("[MAIN] Window not available!");
      throw new Error("Window not available");
    }

    window.close();
  });
