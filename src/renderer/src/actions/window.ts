// Window controls - use direct sys API (instant, no ORPC dependency)

interface ElectronSys {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

export function minimizeWindow() {
  const electron = (window as unknown as { electron?: { sys?: ElectronSys } })
    .electron;
  electron?.sys?.minimize();
}

export function maximizeWindow() {
  const electron = (window as unknown as { electron?: { sys?: ElectronSys } })
    .electron;
  electron?.sys?.maximize();
}

export function closeWindow() {
  const electron = (window as unknown as { electron?: { sys?: ElectronSys } })
    .electron;
  electron?.sys?.close();
}
