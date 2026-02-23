import { os } from "@orpc/server";
import { ipcContext } from "../context";

export const minimizeWindow = os
  .use(ipcContext.mainWindowContext)
  .handler(({ context }) => {
    const { window } = context;

    if (!window) {
      throw new Error("Window not available");
    }

    window.minimize();
  });

export const maximizeWindow = os
  .use(ipcContext.mainWindowContext)
  .handler(({ context }) => {
    const { window } = context;

    if (!window) {
      throw new Error("Window not available");
    }

    if (window.isMaximized()) {
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
      throw new Error("Window not available");
    }

    window.close();
  });
