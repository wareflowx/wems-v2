// Window controls - use direct sys API (instant, no ORPC dependency)

interface ElectronSys {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

export function minimizeWindow() {
  console.log("[DEBUG] minimizeWindow called");
  const electron = (window as unknown as { electron?: { sys?: ElectronSys } })
    .electron;
  electron?.sys?.minimize();
}

export function maximizeWindow() {
  console.log("[DEBUG] maximizeWindow called");
  const electron = (window as unknown as { electron?: { sys?: ElectronSys } })
    .electron;
  electron?.sys?.maximize();
}

export function closeWindow() {
  console.log("[DEBUG] closeWindow called");
  const electron = (window as unknown as { electron?: { sys?: ElectronSys } })
    .electron;
  electron?.sys?.close();
}
