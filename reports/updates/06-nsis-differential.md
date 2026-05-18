# NSIS Configuration

## Simple Setup for Small Teams

For 10 users, a full installer download (~150MB) is acceptable.

**Recommended config:**
```json
"nsis": {
  "differentialPackage": false,  // Full installer is fine for small team
  "oneClick": false,
  "allowToChangeInstallationDirectory": true
}
```

**GitHub Releases Integration:**
```json
"publish": {
  "provider": "github",
  "owner": "wareflowx",
  "repo": "wems-v2"
}
```

When you push a tag, electron-builder automatically creates the release.