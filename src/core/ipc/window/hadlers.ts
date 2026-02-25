import { os } from "@orpc/server";
import { ipcContext } from "../context";

export const minimizeWindow = os
  .use(ipcContext.mainWindowContext)
  .handler(({ context }) => {
    console.log(
      "[MAIN] minimizeWindow handler called, context.window:",
      context.window
    );
    const { window } = context;

    if (!window) {
      console.error("[MAIN] Window not available!");
      throw new Error("Window not available");
    }

    console.log("[MAIN] Calling window.minimize()");
    window.minimize();
    console.log("[MAIN] window.minimize() called");
  });

export const maximizeWindow = os
  .use(ipcContext.mainWindowContext)
  .handler(({ context }) => {
    console.log(
      "[MAIN] maximizeWindow handler called, context.window:",
      context.window
    );
    const { window } = context;

    if (!window) {
      console.error("[MAIN] Window not available!");
      throw new Error("Window not available");
    }

    const isMax = window.isMaximized();
    console.log("[MAIN] window.isMaximized():", isMax);
    if (isMax) {
      window.unmaximize();
    } else {
      window.maximize();
    }
    console.log("[MAIN] maximize/unmaximize called");
  });

export const closeWindow = os
  .use(ipcContext.mainWindowContext)
  .handler(({ context }) => {
    console.log(
      "[MAIN] closeWindow handler called, context.window:",
      context.window
    );
    const { window } = context;

    if (!window) {
      console.error("[MAIN] Window not available!");
      throw new Error("Window not available");
    }

    console.log("[MAIN] Calling window.close()");
    window.close();
    console.log("[MAIN] window.close() called");
  });
