# Error Handling Strategies

## 4.1 Error Categories and Recovery

| Error Type | Cause | Recovery Action |
|------------|-------|-----------------|
| Network timeout | Cannot reach update server | Retry with exponential backoff (max 3 attempts) |
| Signature verification failed | Corrupted or tampered update | Re-download, if fails again report error |
| Disk space insufficient | No room for download/installer | Show dialog asking user to free space |
| Installer already running | Previous update not completed | Wait for lock file removal |
| User cancelled | User closed dialog during download | Return to idle state |
| Server returned 404 | No update published yet | Silent return to idle (not an error) |
| Differential download failed | Blockmap mismatch | Fallback to full download |

---

## 4.2 Retry Logic Implementation

```typescript
async checkForUpdatesWithRetry(maxAttempts = 3): Promise<void> {
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      attempt++;
      await this.updater.checkForUpdates();
      return; // Success
    } catch (error) {
      const isNetworkError = this.isNetworkError(error);

      if (isNetworkError && attempt < maxAttempts) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        log.info(`[UpdateManager] Retry ${attempt}/${maxAttempts} in ${delay}ms`);
        await this.sleep(delay);
      } else {
        // Final failure or non-retryable error
        this.updateState({
          status: "error",
          error: isNetworkError
            ? "Failed to connect to update server"
            : (error as Error).message,
        });
        return;
      }
    }
  }
}

private isNetworkError(error: any): boolean {
  const message = (error?.message || "").toLowerCase();
  return (
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("econnrefused") ||
    message.includes("socket")
  );
}

private sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**Retry Strategy:**
- Attempt 1: Immediate
- Attempt 2: Wait 2 seconds
- Attempt 3: Wait 4 seconds
- After 3 failures: Report error to user

---

## 4.3 Before-Quit Cleanup Handler

```typescript
app.on("before-quit", async (event) => {
  const updateManager = getUpdateManager();
  const state = updateManager.getState();

  // If update is downloading, prevent quit
  if (state.status === "downloading") {
    event.preventDefault();

    const result = dialog.showMessageBoxSync({
      type: "question",
      buttons: ["Continue Quit", "Cancel"],
      title: "Update in Progress",
      message: "An update is being downloaded. If you quit now, the update will not be installed.",
      defaultId: 1,
    });

    if (result === 1) {
      // User cancelled quit
      return;
    }
  }

  // Proceed with quit
  logger.info("App before-quit, releasing lock...", "main");
  releaseWriteLock();
});
```

---

## 4.4 Disk Space Check

Before downloading, check if there's enough disk space:

```typescript
private async hasEnoughDiskSpace(requiredBytes: number): Promise<boolean> {
  try {
    const fs = require("node:fs");
    const path = require("node:path");

    // Get temp directory (where download goes)
    const tempDir = app.getPath("temp");
    const stats = fs.statfsSync(tempDir);
    const availableBytes = stats.bsize * stats.bfree;

    return availableBytes >= requiredBytes * 1.1; // 10% buffer
  } catch (error) {
    log.warn("[UpdateManager] Could not check disk space:", error);
    return true; // Assume OK if check fails
  }
}
```

---

## 4.5 Differential Download Fallback

If differential download fails, fallback to full download:

```typescript
this.updater.on("download-progress", (progress) => {
  // Progress is emitted for both differential and full downloads
});

this.updater.on("error", (error) => {
  // If differential download failed, try full download
  if (error.message?.includes("blockmap")) {
    log.info("[UpdateManager] Differential download failed, trying full download");
    this.updater.disableDifferentialDownload = true;
    await this.updater.downloadUpdate();
  } else {
    this.updateState({
      status: "error",
      error: error.message,
    });
  }
});
```