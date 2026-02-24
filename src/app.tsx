import { RouterProvider } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { updateAppLanguage } from "./actions/language";
import { syncWithLocalTheme } from "./actions/theme";
import { router } from "./utils/routes";
import { queryClient } from "./lib/query-client";
import { ipc } from "./ipc/manager";
import { IPC_CHANNELS } from "./constants";
import "./localization/i18n";

// Initialize ORPC after receiving MAIN_READY from main
// This ensures preload is ready to receive the port
window.addEventListener("message", (event) => {
  if (event.data?.type === "main-ready") {
    console.log("[RENDERER] Received MAIN_READY, initializing IPC...");
    ipc.init();
  }
});

// Also initialize if ipc was already ready (dev server reload)
ipc.init();

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Sync theme and language
    syncWithLocalTheme();
    updateAppLanguage(i18n);
  }, [i18n]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

const container = document.getElementById("app");
if (!container) {
  throw new Error('Root element with id "app" not found');
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
