import { ipc } from "@/ipc/manager";

export async function getPlatform() {
  await ipc.waitForReady();
  return ipc.client.app.currentPlatfom();
}

export async function getAppVersion() {
  await ipc.waitForReady();
  return ipc.client.app.appVersion();
}
