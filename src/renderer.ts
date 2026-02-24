import "@/styles/global.css";

// CRITICAL: Set up ORPC port listener BEFORE any other imports
// This ensures we receive the port even if ipc/manager hasn't loaded yet
// The port is sent via window.postMessage from preload
window.addEventListener("message", (event) => {
  if (event.data?.type === "ORPC_PORT" && event.ports[0]) {
    const port = event.ports[0];
    console.log("[RENDERER] Received ORPC_PORT via postMessage!");
    // Store port globally for IPC manager to use
    (window as unknown as { __orpcPort?: MessagePort }).__orpcPort = port;
    // Dispatch custom event so IPC manager can pick it up
    window.dispatchEvent(new CustomEvent("orpc-port-ready"));
  }
});

import "@/app";
