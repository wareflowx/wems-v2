# electron-builder: Complete Configuration Guide (2026)

**Last Updated:** February 16, 2026
**electron-builder Version:** 26.7.0
**Status:** Production Ready

---

## Table of Contents

1. [What is electron-builder?](#what-is-electron-builder)
2. [Installation](#installation)
3. [Configuration File](#configuration-file)
4. [Windows Configuration](#windows-configuration)
5. [macOS Configuration](#macos-configuration)
6. [Linux Configuration](#linux-configuration)
7. [ASAR Configuration](#asar-configuration)
8. [Native Modules](#native-modules)
9. [Publishing & Updates](#publishing--updates)
10. [CI/CD Integration](#cicd-integration)

---

## What is electron-builder?

**electron-builder** is a complete solution to package and build Electron apps for macOS, Windows, and Linux.

### Key Features

1. **Multi-Platform Support** - Windows, macOS, Linux in one config
2. **Code Signing** - Built-in code signing for all platforms
3. **Auto Updates** - Squirrel.Windows and electron-updater support
4. **Flexible Configuration** - JSON, YAML, or JavaScript config
5. **Fast Builds** - Optimized build process
6. **Multiple Targets** - NSIS, AppImage, DMG, MSI, etc.

### electron-builder vs electron-forge Makers

| Feature | electron-forge | electron-builder |
|---------|---------------|------------------|
| **Makers** | Separate plugins | Built-in targets |
| **Configuration** | Multiple files | Single config file |
| **Native Modules** | Known issues | Well-documented |
| **Code Signing** | Complex | Simple |
| **Auto Updates** | Requires plugin | Built-in |

---

## Installation

```bash
npm install -D electron-builder
```

**Or with specific platform:**
```bash
npm install -D electron-builder@latest
```

---

## Configuration File

### File Formats

electron-builder supports three formats:

1. **electron-builder.json** (recommended)
2. **electron-builder.yml**
3. **electron-builder.js** (programmatic)

### JSON Configuration

**electron-builder.json:**

```json
{
  "appId": "com.electron-shadcn",
  "productName": "My Electron App",
  "directories": {
    "output": "dist",
    "buildResources": "build"
  },
  "files": [
    "out/**/*",
    "package.json"
  ],
  "extraResources": [
    "resources/**/*"
  ],
  "asar": true,
  "win": {
    "target": ["nsis"],
    "icon": "build/icon.ico"
  }
}
```

### JavaScript Configuration

**electron-builder.js:**

```javascript
module.exports = {
  appId: "com.electron-shadcn",
  productName: "My Electron App",
  directories: {
    output: "dist",
    buildResources: "build"
  },
  win: {
    target: ["nsis"],
    icon: "build/icon.ico"
  }
};
```

**Benefits:**
- Conditional configuration
- Environment variables
- Dynamic values

---

## Configuration Options

### Basic Options

#### appId

**Unique identifier for your app**

```json
{
  "appId": "com.electron-shadcn"
}
```

**Format:** Reverse domain notation
- `com.company.app`
- `io.github.username.app`
- `org.organization.app`

**Why:**
- Required for auto-updates
- Used in Windows Registry
- macOS bundle identifier

#### productName

**Name of your application**

```json
{
  "productName": "My Electron App"
}
```

**Affects:**
- Executable filename
- Installer title
- Start menu shortcut name

#### directories

**Directory configuration**

```json
{
  "directories": {
    "output": "dist",
    "buildResources": "build"
  }
}
```

**Options:**
- `output` - Where to put build artifacts
- `buildResources` - Icons, certificates, etc.

#### files

**Files to include in app**

```json
{
  "files": [
    "out/**/*",
    "package.json"
  ]
}
```

**Patterns:**
- `**/*` - Recursive wildcard
- `*.js` - All JS files
- `!out/**/*.map` - Exclude source maps

#### extraResources

**Extra files to include**

```json
{
  "extraResources": [
    "src/db/migrations/**/*",
    "resources/config.json"
  ]
}
```

**Output:** Goes to `resources/` in packaged app

---

## Windows Configuration

### Targets

**Available Windows targets:**

1. **NSIS** - Installer with wizard (recommended)
2. **portable** - ZIP archive (no installation)
3. **zip** - Compressed archive
4. **MSI** - Windows Installer

### NSIS Configuration

**Basic NSIS:**

```json
{
  "win": {
    "target": ["nsis"],
    "icon": "build/icon.ico"
  }
}
```

**Advanced NSIS:**

```json
{
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64", "ia32"]
      }
    ],
    "icon": "build/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "perMachine": false,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "allowElevation": false,
    "artifactName": "${productName}-${version}.${ext}",
    "deleteAppDataOnUninstall": false
  }
}
```

### NSIS Options Explained

#### oneClick

```json
"oneClick": false
```

- `true` - One-click installer (default)
- `false` - Custom installer with wizard pages

**When to use `false`:**
- You want a custom wizard
- User needs to choose install directory
- Multiple installation types

#### allowToChangeInstallationDirectory

```json
"allowToChangeInstallationDirectory": true
```

Lets user choose where to install.

**Default:** `%LOCALAPPDATA%` (User's local AppData)

#### perMachine

```json
"perMachine": false
```

- `false` - Install for current user only (no admin) ✅
- `true` - Install for all users (requires admin)

**Recommendation:** Use `false` for Electron apps

#### createDesktopShortcut

```json
"createDesktopShortcut": true
```

Creates desktop shortcut after installation.

#### createStartMenuShortcut

```json
"createStartMenuShortcut": true
```

Creates Start Menu shortcut.

#### allowElevation

```json
"allowElevation": false
```

If `false`, installer won't request admin rights even if needed.

#### deleteAppDataOnUninstall

```json
"deleteAppDataOnUninstall": false
```

If `true`, deletes app data on uninstall.

**Recommendation:** Keep `false` to preserve user data.

### Portable Configuration

```json
{
  "win": {
    "target": [
      {
        "target": "portable",
        "artifactName": "${productName}-${version}-portable.${ext}"
      }
    ]
  },
  "portable": {
    "artifactName": "${productName}-${version}-portable.${ext}"
  }
}
```

### Code Signing (Windows)

```json
{
  "win": {
    "certificateFile": "certs/windows-cert.pfx",
    "certificatePassword": "${WINDOWS_CERT_PASSWORD}"
  }
}
```

**Environment variable:**
```bash
export WINDOWS_CERT_PASSWORD="your-password"
```

---

## macOS Configuration

### Targets

**Available macOS targets:**

1. **dmg** - Disk image (most common)
2. **zip** - Compressed archive
3. **pkg** - Installer package

### DMG Configuration

```json
{
  "mac": {
    "target": ["dmg"],
    "icon": "build/icon.icns",
    "category": "public.app-category.productivity"
  },
  "dmg": {
    "contents": [
      {
        "x": 130,
        "y": 220
      },
      {
        "x": 410,
        "y": 220,
        "type": "link",
        "path": "/Applications"
      }
    ],
    "window": {
      "width": 540,
      "height": 380
    }
  }
}
```

### macOS Options

#### category

**Mac App Store category**

```json
{
  "mac": {
    "category": "public.app-category.productivity"
  }
}
```

**Common categories:**
- `public.app-category.productivity`
- `public.app-category.developer-tools`
- `public.app-category.utilities`

#### hardenedRuntime

```json
{
  "mac": {
    "hardenedRuntime": true
  }
}
```

Enables hardened runtime (security feature).

#### gatekeeperAssess

```json
{
  "mac": {
    "gatekeeperAssess": false
  }
}
```

Disables Gatekeeper assessment for development.

### Code Signing (macOS)

```json
{
  "mac": {
    "identity": "Developer ID Application: Your Name (TEAM_ID)"
  }
}
```

**Or with environment variable:**
```bash
export CSC_IDENTITY_AUTO_DISCOVERY="false"
export CSC_LINK="certs/mac-cert.p12"
export CSC_KEY_PASSWORD="your-password"
```

---

## Linux Configuration

### Targets

**Available Linux targets:**

1. **AppImage** - Universal Linux format (recommended)
2. **deb** - Debian/Ubuntu package
3. **rpm** - Red Hat/Fedora package
4. **freebsd** - FreeBSD package
5. **pacman** - Arch Linux package
6. **apk** - Alpine Linux package

### AppImage Configuration

```json
{
  "linux": {
    "target": ["AppImage"],
    "icon": "build/icons",
    "category": "Utility"
  },
  "appImage": {
    "artifactName": "${productName}-${version}-${arch}.${ext}",
    "synopsis": "My Electron App",
    "category": "Utility"
  }
}
```

### DEB Configuration

```json
{
  "linux": {
    "target": ["deb"],
    "icon": "build/icons",
    "category": "Utility",
    "maintainer": "Your Name <email@example.com>"
  },
  "deb": {
    "depends": [
      "gconf2",
      "gconf-service",
      "libnotify4",
      "libappindicator1",
      "libxtst6",
      "libnss3"
    ]
  }
}
```

### RPM Configuration

```json
{
  "linux": {
    "target": ["rpm"],
    "icon": "build/icons",
    "category": "Utility"
  },
  "rpm": {
    "fpm": ["--rpm-rpmbuild-define=_build_id_links none"]
  }
}
```

---

## ASAR Configuration

### What is ASAR?

ASAR is a tar-like archive format that Electron uses to package your app.

### Basic ASAR Config

```json
{
  "asar": true
}
```

### Advanced ASAR

```json
{
  "asar": true,
  "asarUnpack": [
    "node_modules/better-sqlite3/**",
    "resources/**/*"
  ],
  "asarUnpackDir": "some-subdir"
}
```

### Options Explained

#### asar

```json
"asar": true
```

- `true` - Enable ASAR archiving (recommended)
- `false` - Don't use ASAR (faster startup, larger size)

#### asarUnpack

**Files to extract from ASAR:**

```json
{
  "asarUnpack": [
    "node_modules/better-sqlite3/**"  // Extract native modules
  ]
}
```

**Output structure:**
```
resources/
├── app.asar (563 MB)
└── app.asar.unpacked/
    └── node_modules/
        └── better-sqlite3/
            └── build/
                └── Release/
                    └── better_sqlite3.node
```

#### Pattern Matching

```json
{
  "asarUnpack": [
    "node_modules/better-sqlite3/**",       // Recursive
    "node_modules/sharp/**/*.node",          // Specific files
    "resources/**/*",                        // All resources
    "node_modules/**/*.node"                 // All native modules
  ]
}
```

---

## Native Modules

### The Problem

Native modules (`*.node` files) cannot be loaded from ASAR archives.

### The Solution

```json
{
  "asar": true,
  "asarUnpack": [
    "node_modules/better-sqlite3/**"
  ]
}
```

### Multiple Native Modules

```json
{
  "asarUnpack": [
    "node_modules/better-sqlite3/**",
    "node_modules/sharp/**",
    "node_modules/usb/**"
  ]
}
```

### Verify Unpacking

After building, verify:

```bash
ls dist/win-unpacked/resources/app.asar.unpacked/node_modules/

# Should see your unpacked modules
```

---

## Publishing & Updates

### Auto Updates with electron-updater

**Configuration:**

```json
{
  "publish": {
    "provider": "github",
    "owner": "your-github-username",
    "repo": "your-repo-name"
  }
}
```

### GitHub Releases

```json
{
  "publish": {
    "provider": "github",
    "releaseType": "release"
  }
}
```

### Private Repository

```json
{
  "publish": {
    "provider": "github",
    "private": true
  }
}
```

**Environment variable:**
```bash
export GH_TOKEN="your-github-token"
```

### S3 Storage

```json
{
  "publish": {
    "provider": "s3",
    "bucket": "my-bucket",
    "path": "releases"
  }
}
```

### Custom Server

```json
{
  "publish": {
    "provider": "generic",
    "url": "https://updates.example.com/releases"
  }
}
```

---

## CI/CD Integration

### GitHub Actions

**.github/workflows/release.yml:**

```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

permissions:
  contents: write

jobs:
  release:
    runs-on: windows-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Package Windows
        run: npm run package -- --win --publish never

      - name: Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            dist/*.exe
            dist/*.zip
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Multi-Platform Build

```yaml
jobs:
  release:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - run: npm ci
      - run: npm run build

      - name: Package
        run: npm run package -- --publish always

      - name: Release
        uses: softprops/action-gh-release@v2
        with:
          files: dist/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Package.json Scripts

### Development Scripts

```json
{
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview"
  }
}
```

### Package Scripts

```json
{
  "scripts": {
    "package:win": "npm run build && electron-builder --win",
    "package:mac": "npm run build && electron-builder --mac",
    "package:linux": "npm run build && electron-builder --linux",
    "package:all": "npm run build && electron-builder -mwl"
  }
}
```

### Publish Scripts

```json
{
  "scripts": {
    "release": "npm run build && electron-builder --publish always"
  }
}
```

---

## Advanced Configuration

### Conditional Configuration

**electron-builder.js:**

```javascript
module.exports = {
  appId: "com.electron-shadcn",
  productName: "My App",
  win: {
    target: process.env.CI ? ["nsis"] : ["dir"]
  }
};
```

### Platform-Specific Files

```json
{
  "win": {
      "build/icon-mac.icns"
    ]
  },
  "mac": {
      "build/icon-win.ico"
    ]
  }
}
```

### Metadata Injection

```json
{
  "extraMetadata": {
    "main": "out/main/main.js",
    "version": "1.0.0"
  }
}
```

### AfterPack Hook

**electron-builder.js:**

```javascript
module.exports = {
  afterPack: async (context) => {
    // Custom logic after packaging
    console.log('Packaged:', context.outDir);
  }
};
```

### BeforePack Hook

```javascript
module.exports = {
  beforePack: async (context) => {
    // Custom logic before packaging
    console.log('Packaging:', context.appOutDir);
  }
};
```

---

## Troubleshooting

### Build Fails

**Common causes:**
1. Missing icon files
2. Invalid JSON in config
3. Missing build resources

**Solution:**
```bash
# Validate config
npx electron-builder --help

# Verbose output
npm run package -- --verbose
```

### Icon Not Showing

**Check:**
```json
{
  "win": {
    "icon": "build/icon.ico"  // Must be .ico
  },
  "mac": {
    "icon": "build/icon.icns"  // Must be .icns
  },
  "linux": {
    "icon": "build/icons"  // Must be directory
  }
}
```

### Large Package Size

**Solutions:**
1. Use `asar: true`
2. Exclude dev dependencies
3. Minimize dependencies

```json
{
  "asar": true,
  "files": [
    "out/**/*",
    "package.json"
  ]
}
```

### App Won't Start

**Check:**
1. `package.json` main entry point
2. ASAR unpacking for native modules
3. Console logs

---

## Resources

### Official Documentation
- [electron-builder Documentation](https://www.electron.build)
- [electron-builder GitHub](https://github.com/electron-userland/electron-builder)
- [Configuration Options](https://www.electron.build/configuration/configuration)

### Icons & Assets
- [PNG to ICO](https://convertico.com/)
- [PNG to ICNS](https://cloudconvert.com/png-to-icns)
- [Icon Set Generator](https://iconverticons.com/online/)

### Code Signing
- [Windows Code Signing](https://www.electron.build/code-signing#windows)
- [macOS Code Signing](https://www.electron.build/code-signing#macos)

### CI/CD
- [GitHub Actions](https://github.com/features/actions)
- [electron-builder Action](https://github.com/slemeur/github-action-electron-builder)

---

**Last Updated:** February 16, 2026
**electron-builder Version:** 26.7.0
**Document Version:** 1.0
