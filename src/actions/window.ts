import { ipc } from "../ipc/manager";

export async function minimizeWindow() {
  console.log("[DEBUG] minimizeWindow called");
  try {
    await ipc.waitForReady();
    console.log("[DEBUG] minimizeWindow: ORPC ready, calling handler");
    await ipc.client.window.minimizeWindow();
    console.log("[DEBUG] minimizeWindow: done");
  } catch (error) {
    console.error("[DEBUG] minimizeWindow error:", error);
  }
}
export async function maximizeWindow() {
  console.log("[DEBUG] maximizeWindow called");
  try {
    await ipc.waitForReady();
    console.log("[DEBUG] maximizeWindow: ORPC ready, calling handler");
    await ipc.client.window.maximizeWindow();
    console.log("[DEBUG] maximizeWindow: done");
  } catch (error) {
    console.error("[DEBUG] maximizeWindow error:", error);
  }
}
export async function closeWindow() {
  console.log("[DEBUG] closeWindow called");
  try {
    await ipc.waitForReady();
    console.log("[DEBUG] closeWindow: ORPC ready, calling handler");
    await ipc.client.window.closeWindow();
    console.log("[DEBUG] closeWindow: done");
  } catch (error) {
    console.error("[DEBUG] closeWindow error:", error);
  }
}
