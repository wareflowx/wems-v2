import { ipc } from "@/ipc/manager";

export function getPosts() {
  return ipc.client.database.getPosts();
}

export function createPost(data: { title: string; content: string }) {
  return ipc.client.database.createPost(data);
}
