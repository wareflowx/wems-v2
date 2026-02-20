import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "./constants";

window.addEventListener("message", (event) => {
  if (event.data === IPC_CHANNELS.START_ORPC_SERVER) {
    const [serverPort] = event.ports;

    ipcRenderer.postMessage(IPC_CHANNELS.START_ORPC_SERVER, null, [serverPort]);
  }
});

// Expose write mode to renderer
window.getWriteMode = () => ipcRenderer.invoke(IPC_CHANNELS.GET_WRITE_MODE);
