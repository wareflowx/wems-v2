import { ipc } from "../ipc/manager";

export async function minimizeWindow() {
  console.log("[DEBUG] minimizeWindow called");
  await ipc.waitForReady();
  console.log("[DEBUG] minimizeWindow: ORPC ready, calling handler");
  await ipc.client.window.minimizeWindow();
  console.log("[DEBUG] minimizeWindow: done");
}
export async function maximizeWindow() {
  console.log("[DEBUG] maximizeWindow called");
  await ipc.waitForReady();
  console.log("[DEBUG] maximizeWindow: ORPC ready, calling handler");
  await ipc.client.window.maximizeWindow();
  console.log("[DEBUG] maximizeWindow: done");
}
export async function closeWindow() {
  console.log("[DEBUG] closeWindow called");
  await ipc.waitForReady();
  console.log("[DEBUG] closeWindow: ORPC ready, calling handler");
  await ipc.client.window.closeWindow();
  console.log("[DEBUG] closeWindow: done");
}
