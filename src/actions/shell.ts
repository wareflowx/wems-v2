import { ipc } from "@/ipc/manager";

export async function openExternalLink(url: string) {
  await ipc.waitForReady();
  return ipc.client.shell.openExternalLink({ url });
}
