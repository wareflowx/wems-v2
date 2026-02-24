import "@/styles/global.css";
import { ipcRenderer } from "electron";

// Request ORPC port from preload immediately
// This is done early to ensure we get the port as soon as preload has it
console.log("[RENDERER] Requesting ORPC port from preload...");
ipcRenderer.send("GET_ORPC_PORT");

// Listen for port response from preload
ipcRenderer.on("ORPC_PORT_RESPONSE", (event) => {
  const [port] = event.ports;
  if (port) {
    console.log("[RENDERER] Received ORPC_PORT via IPC!");
    console.log("[RENDERER] port.constructor:", port.constructor?.name);
    console.log("[RENDERER] typeof port.addEventListener:", typeof port.addEventListener);
    // Store globally for IPC manager
    (window as unknown as { __orpcPort?: MessagePort }).__orpcPort = port;
    // Dispatch event so IPC manager can pick it up
    window.dispatchEvent(new CustomEvent("orpc-port-ready"));
  }
});

import "@/app";
