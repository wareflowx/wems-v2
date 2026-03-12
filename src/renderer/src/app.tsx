import { ipc } from "@@/ipc/manager";
import { queryClient } from "@@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import { updateAppLanguage } from "@/actions/language";
import { syncWithLocalTheme } from "@/actions/theme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { router } from "./utils/routes";
import { migrateAddNotesTable } from "@/actions/database";
import "./localization/i18n";

// Track if initial migration has been run
let initialMigrationDone = false;

// Initialize ORPC after receiving MAIN_READY from main
// This ensures preload is ready to receive the port
window.addEventListener("message", async (event) => {
  if (event.data?.type === "main-ready") {
    console.log("[RENDERER] Received MAIN_READY, initializing IPC...");
    // Run migration BEFORE initializing IPC to ensure schema is ready
    if (!initialMigrationDone) {
      try {
        console.log("[MIGRATIONS] Running database migrations...");
        await migrateAddNotesTable();
        console.log("[MIGRATIONS] Migrations completed");
        initialMigrationDone = true;
      } catch (error) {
        console.error("[MIGRATIONS] Error running migrations:", error);
      }
    }
    ipc.init();
  }
});

// Also initialize if ipc was already ready (dev server reload)
// Run migration BEFORE ipc.init()
const initApp = async () => {
  if (!initialMigrationDone) {
    try {
      console.log("[MIGRATIONS] Running database migrations...");
      await migrateAddNotesTable();
      console.log("[MIGRATIONS] Migrations completed");
      initialMigrationDone = true;
    } catch (error) {
      console.error("[MIGRATIONS] Error running migrations:", error);
    }
  }
  ipc.init();
};

initApp();

export default function App() {
  const { i18n } = useTranslation();
  const [migrationsRan, setMigrationsRan] = useState(initialMigrationDone);

  useEffect(() => {
    setMigrationsRan(initialMigrationDone);
  }, []);

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
