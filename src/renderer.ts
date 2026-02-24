import "@/styles/global.css";

// Register callback for ORPC port before anything else loads
// This ensures we catch the port as soon as preload has it
const globalWindow = window as unknown as {
  onORPCPortReady?: (callback: (port: MessagePort) => void) => void;
};

if (globalWindow.onORPCPortReady) {
  console.log("[RENDERER] Registering onORPCPortReady callback early...");
  globalWindow.onORPCPortReady((port) => {
    console.log("[RENDERER] onORPCPortReady callback fired early!");
    (window as unknown as { __orpcPort?: MessagePort }).__orpcPort = port;
  });
}

import "@/app";
