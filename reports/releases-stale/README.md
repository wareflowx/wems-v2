# Release Build Analysis: Stale Artifacts & Blockmap Generation

**Date:** 2026-04-09
**Review Status:** Updated with corrections from deep technical review
**Validity:** Partially correct -- contains inaccuracies requiring correction

---

## Issue 1: Stale `WEMS 2.0.6.exe` File

### Observation

When releasing version 2.1.5, the following artifacts appeared in the release:

| File | Size | Age |
|------|------|-----|
| `WEMS 2.0.6.exe` | 114 MB | 3 weeks ago |
| `WEMS Setup 2.1.5.exe` | 133 MB | 20 hours ago |

The stale `WEMS 2.0.6.exe` should not be present after a clean build.

### Root Cause (CORRECTED)

**The original workflow had ZERO cleanup.** The report's initial claim of "incomplete cleanup" or "cross-release contamination" was inaccurate.

```yaml
# Original workflow (before fix) - NO cleanup step
- name: Build application
  run: npm run build
- name: Package for Windows
  run: npm run package -- --win --publish never
- name: Release
  uses: softprops/action-gh-release@v2
  with:
    files: |
      dist/*.exe    # Uploaded ALL .exe files -- no cleanup before build
```

If a previous build left `WEMS 2.0.6.exe` in `dist`, and v2.1.5's build did not overwrite it (partial failure, build didn't produce a new exe), the old artifact persisted and was uploaded.

**IMPORTANT:** Cross-release contamination in CI is **NOT possible** on ephemeral GitHub Actions runners. Each run gets a fresh VM with no persistent filesystem. The mention of `APPADATA/electron-builder` contamination between runs in the original report was incorrect -- these caches exist only within a single runner's filesystem.

### Portable Target Theory (LIKELY WRONG)

The original report suggested `WEMS 2.0.6.exe` (no "Setup") might be from a **portable** target build. However:

```json
// electron-builder.json - only NSIS target exists
"win": {
  "target": ["nsis"],  // No portable target configured
  "icon": "build/icon.ico"
}
```

The filename `WEMS 2.0.6.exe` without "Setup" is genuinely anomalous. Most likely explanations:

1. **GitHub draft release with manually uploaded portable exe** -- draft releases persist and can contain manually uploaded artifacts
2. **Local development build** that was somehow included in the release

### Files Involved

- `electron-builder.json` -- main electron-builder configuration (NSIS only)
- `.github/workflows/release.yml` -- CI/CD release pipeline

### Recommendation

The workflow already added cleanup in commits `1f2ff51` and `cddba44`. However, the cleanup uses `-ErrorAction SilentlyContinue` which masks failures.

**Priority 1: Improve error handling**

Replace silent error suppression with explicit failure:

```yaml
- name: Clean build folders
  run: |
    $failed = $false
    foreach ($dir in @("dist", "out")) {
      if (Test-Path $dir) {
        Write-Output "Removing $dir..."
        Remove-Item -Recurse -Force $dir -ErrorAction Stop
        if ($LASTEXITCODE -ne 0) { $failed = $true }
      }
    }
    foreach ($path in @(
      "$env:LOCALAPPDATA/electron-builder/Cache",
      "$env:APPDATA/electron-builder"
    )) {
      if (Test-Path $path) {
        Write-Output "Removing $path..."
        Remove-Item -Recurse -Force $path -ErrorAction Stop
        if ($LASTEXITCODE -ne 0) { $failed = $true }
      }
    }
    if ($failed) { exit 1 }
```

**Priority 2: Add fail-safe verification**

Current "Verify clean dist" only lists files but does not fail. Add actual validation:

```yaml
- name: Verify clean dist
  run: |
    if ((Test-Path "dist") -and (Get-ChildItem "dist" -File | Where-Object { $_.Name -match '\.(exe|zip)$' })) {
      Write-Output "ERROR: Stale artifacts found in dist:"
      Get-ChildItem "dist" -File | Where-Object { $_.Name -match '\.(exe|zip)$' } | Format-Table Name,Length,LastWriteTime
      exit 1
    }
    Write-Output "Dist is clean."
```

---

## Issue 2: `.blockmap` File Generation

### Observation

A `WEMS Setup 2.1.5.exe.blockmap` file appeared in the release artifacts. This file type was considered unexpected for standard NSIS installers.

### Root Cause (TECHNICALLY CORRECT but MISLEADING)

In electron-builder's NSIS target, **differential-aware builds** are enabled by default when `differentialPackage` is not explicitly set to `false`:

```javascript
// electron-builder internal logic (NsisTarget.js:65-66)
get isBuildDifferentialAware() {
  return !this.isPortable && this.options.differentialPackage !== false;
}

// NsisTarget.js:307-308
else if (this.isBuildDifferentialAware) {
  updateInfo = await createBlockmap(installerPath, this, packager, safeArtifactName);
}
```

### Important Correction

The original report stated `.blockmap` is "primarily useful for AppX/MSIX" and "unexpected for standard NSIS installers." **This is incorrect.**

**Blockmaps ARE expected for NSIS when using electron-updater.** The `.blockmap` format is used by electron-updater to support differential updates (delta patches) -- downloading only the changed parts of the installer rather than the full installer each time.

This is NOT just an AppX/MSIX feature; NSIS builds in electron-builder use blockmaps specifically to enable electron-updater differential updates.

### Recommendation

**Before** setting `differentialPackage: false`, verify whether the project uses electron-updater:

```bash
grep -r "update-electron-app\|electron-updater\|autoUpdater" \
  --include="*.ts" --include="*.tsx" src/
```

- **If using electron-updater:** Keep blockmap generation enabled -- it is required for delta updates
- **If NOT using electron-updater:** Add `differentialPackage: false` to eliminate unnecessary blockmap files:

```json
"nsis": {
  "differentialPackage": false,
  "oneClick": false,
  "allowToChangeInstallationDirectory": true,
  "perMachine": false,
  "createDesktopShortcut": true,
  "createStartMenuShortcut": true
}
```

---

## Edge Cases Identified

| Edge Case | Finding |
|-----------|---------|
| Portable target | **Ruled out** -- only NSIS target configured |
| GitHub draft release | **Likely** -- stale exe may have been manually uploaded to a draft release |
| Git LFS / artifact caching | **Not the issue** -- `dist` is not in Git, artifacts are separate mechanism |
| Multiple targets (msi, appx, etc.) | **Ruled out** -- only NSIS in config |
| Ephemeral runner contamination | **Impossible** -- each CI run gets fresh VM |
| NSIS filename pattern | **Already corrected** in commit `4bc1ac9` -- workflow uses `dist/*Setup*.exe` |

---

## Improved Action Plan

| Priority | Action | Expected Outcome |
|----------|--------|-------------------|
| **1** | Verify electron-updater usage | Determine if blockmap is needed or optional |
| **2** | Add `differentialPackage: false` if no auto-updater | Eliminates unnecessary blockmap files |
| **3** | Replace `-ErrorAction SilentlyContinue` with `-ErrorAction Stop` + failure handling | Cleanup failures no longer silently ignored |
| **4** | Add fail-safe verification that actually fails the build | Catches stale artifacts before they reach release |
| **5** | Consider caching electron-builder cache | Faster builds while maintaining cleanliness |

### Optional: Add Caching Strategy

If builds are slow, consider caching electron-builder's native module cache between runs:

```yaml
- name: Cache electron-builder
  uses: actions/cache@v4
  with:
    path: |
      ${{ env.LOCALAPPDATA }}/electron-builder/Cache
      ${{ env.APPDATA }}/electron-builder
    key: eb-win-${{ hashFiles('**/package-lock.json') }}
    restore-keys: eb-win-
```

Then only clean `dist` and `out`, preserving the builder cache for faster rebuilds.

---

## Summary of Corrections to Original Report

| Original Claim | Verdict | Correction |
|----------------|---------|------------|
| Stale exe due to "incomplete cleanup" or "cross-release contamination" | **INCOMPLETE** | Original workflow had **NO cleanup at all**. Cross-release contamination is impossible on ephemeral CI runners. |
| Stale exe filename suggests portable target | **LIKELY WRONG** | No portable target configured. File likely came from a draft GitHub release or local development build. |
| `.blockmap` is "unexpected for standard NSIS" | **INCORRECT** | Blockmaps are expected for NSIS when using electron-updater. |
| `differentialPackage` is primarily for AppX/MSIX | **MISLEADING** | NSIS also uses blockmaps for electron-updater differential updates. |
| Adding verification step is the best approach | **PARTIAL** | Verification is useful but should FAIL the build, not just log. |
| `differentialPackage: false` is the right fix | **DEPENDS** | Only correct if NOT using electron-updater for auto-updates. |

---

## References

- electron-builder NSIS target: `node_modules/electron-builder/out/targets/NsisTarget.js`
- Differential update builder: `node_modules/electron-builder/out/differentialUpdateInfoBuilder.js`
- NSIS filename pattern: `NsisTarget.js` lines 99-102
- `isBuildDifferentialAware`: `NsisTarget.js` lines 65-66
