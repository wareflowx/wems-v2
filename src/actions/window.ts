import { ipc } from "../ipc/manager";

export async function minimizeWindow() {
  await ipc.waitForReady();
  await ipc.client.window.minimizeWindow();
}
export async function maximizeWindow() {
  await ipc.waitForReady();
  await ipc.client.window.maximizeWindow();
}
export async function closeWindow() {
  await ipc.waitForReady();
  await ipc.client.window.closeWindow();
}
