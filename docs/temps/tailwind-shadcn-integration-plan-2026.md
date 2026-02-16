# Tailwind CSS v4 + shadcn/ui Integration Plan for Electron (2026)

**Date:** February 16, 2026
**Project:** electron-shadcn v2.0
**Status:** Ready to Implement
**Electron-vite Version:** 5.0.0
**Tailwind CSS Version:** 4.1.18
**shadcn/ui Version:** 3.8.2

---

## 📊 Executive Summary

**Current State Analysis:**
- ✅ All dependencies already installed (Tailwind v4.1.18, @tailwindcss/vite, shadcn CLI)
- ✅ Global CSS file exists at `src/styles/global.css` with proper Tailwind v4 imports
- ✅ electron-vite 5.0.0 configured
- ⚠️ **Critical Issue:** CSS not loading in renderer process
- ⚠️ Missing `@tailwindcss/vite` plugin configuration in electron-vite config

**Root Cause Identified:**
1. CSS is imported in `src/renderer.ts` ✅ (recently fixed)
2. BUT `@tailwindcss/vite` plugin is NOT configured in `electron.vite.config.ts` ❌
3. This means Tailwind v4's Vite plugin is not processing CSS files

**Solution:** Configure `@tailwindcss/vite` plugin in electron-vite renderer config (5-minute fix)

**Time to Complete:** ~30 minutes
**Risk Level:** Low

---

## 🎯 Objectives

1. **Primary:** Fix CSS loading in development and production
2. **Secondary:** Verify shadcn/ui components work correctly
3. **Tertiary:** Document the setup for future reference

---

## 📦 Current Inventory

### Dependencies Already Installed (from package.json)

**Tailwind CSS v4 Stack:**
```json
{
  "tailwindcss": "^4.1.18",           // Latest Tailwind v4 (January 2026)
  "@tailwindcss/vite": "^4.1.18",     // Official Vite plugin for Tailwind v4
  "tw-animate-css": "^1.4.0",         // Tailwind animations
  "tailwind-merge": "^3.4.0",         // Merge utility for shadcn/ui
  "clsx": "^2.1.1",                   // Conditional classes
  "class-variance-authority": "^0.7.1" // Component variants
}
```

**shadcn/ui Stack:**
```json
{
  "shadcn": "^3.8.2",                 // shadcn CLI (latest)
  "lucide-react": "^0.563.0",         // Icon library
  "@radix-ui/react-*": "various",     // Radix UI primitives
  "sonner": "^2.0.7",                 // Toast notifications
  "vaul": "^1.1.2",                   // Drawer component
  "cmdk": "^1.1.1",                   // Command menu
  "embla-carousel-react": "^8.6.0"    // Carousel component
}
```

**Build System:**
```json
{
  "vite": "^7.3.1",                   // Latest Vite
  "electron-vite": "^5.0.0",          // electron-vite 5.0 (December 2025)
  "@vitejs/plugin-react": "^5.1.3"    // React plugin
}
```

### Existing Configuration Files

**✅ `src/styles/global.css` - Correctly Configured**
```css
@import "tailwindcss";              /* ✅ Tailwind v4 syntax */
@import "tw-animate-css";           /* Animations */
@import "shadcn/tailwind.css";      /* shadcn base styles */
@import "@fontsource-variable/geist";
@import "@fontsource-variable/geist-mono";

/* Custom theme variables with CSS custom properties */
:root { ... }
.dark { ... }
@theme inline { ... }
@layer base { ... }
```

**✅ `src/renderer.ts` - Recently Fixed**
```typescript
import "@/styles/global.css";  /* ✅ CSS import added */
import "@/app";
```

**⚠️ `electron.vite.config.ts` - MISSING PLUGIN**
```typescript
export default defineConfig({
  renderer: {
    root: '.',
    server: {
      host: '127.0.0.1',
      port: 5173
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
      },
      target: 'chrome108'
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
    // ❌ NO @tailwindcss/vite PLUGIN CONFIGURED!
  }
});
```

---

## 🔍 Deep Analysis: Why CSS Isn't Loading

### The Problem

Tailwind CSS v4 uses a **first-party Vite plugin** (`@tailwindcss/vite`) that:
1. Scans your files for utility classes
2. Generates optimized CSS on-the-fly
3. Enables features like `@apply`, `@theme`, `@variant`
4. Processes Tailwind directives in CSS files

**Without this plugin:**
- `@import "tailwindcss"` is NOT processed
- Utility classes are NOT generated
- Only raw CSS (variables, layers) works
- No Tailwind functionality available

### Why shadcn/ui Needs This

All shadcn/ui components use Tailwind utility classes:
```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90" />
```

Without Tailwind processing, these classes mean nothing → **components appear unstyled**.

### Why electron-vite Needs Special Configuration

electron-vite has **three separate processes**:
1. **Main** - Node.js backend (no CSS needed)
2. **Preload** - Bridge scripts (no CSS needed)
3. **Renderer** - React UI (CSS plugin goes here ⭐)

The `@tailwindcss/vite` plugin must ONLY be in the **renderer config**, not globally.

---

## 🚀 Implementation Plan (2026 Edition)

### Phase 1: Configure Tailwind v4 Plugin (CRITICAL)

**Step 1.1: Update electron-vite config**

File: `electron.vite.config.ts`

```typescript
import { defineConfig } from 'electron-vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';  // ⭐ ADD THIS IMPORT

export default defineConfig({
  // Main process (no changes)
  main: { /* ... */ },

  // Preload scripts (no changes)
  preload: { /* ... */ },

  // Renderer process - ADD TAILWIND PLUGIN
  renderer: {
    root: '.',
    server: {
      host: '127.0.0.1',
      port: 5173
    },
    plugins: [                        // ⭐ ADD THIS SECTION
      tailwindcss()
    ],
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
      },
      target: 'chrome108'
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  }
});
```

**Step 1.2: Verify CSS import**

File: `src/renderer.ts`

```typescript
// ✅ Should already be there (added in recent fix)
import "@/styles/global.css";
import "@/app";
```

**Step 1.3: Test development mode**

```bash
npm run dev
```

**Expected Results:**
- ✅ App launches with styles applied
- ✅ Tailwind utility classes work (text, colors, spacing)
- ✅ shadcn/ui components render correctly
- ✅ Theme variables (CSS custom properties) work

**Time:** 5 minutes | **Risk:** Low

---

### Phase 2: Verify Tailwind v4 Features

**Step 2.1: Test utility classes**

Create a test component or use an existing one:

```tsx
// Test component with Tailwind classes
<div className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600">
  If this is blue with white text and rounded corners, Tailwind works!
</div>
```

**Step 2.2: Test CSS custom properties**

The `global.css` uses CSS variables:
```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... */
}
```

Test in component:
```tsx
<div style={{ backgroundColor: 'var(--background)' }}>
  Background variable test
</div>
```

**Step 2.3: Test dark mode**

Verify theme switching works (should already be implemented in `src/actions/theme.ts`).

**Time:** 10 minutes | **Risk:** Low

---

### Phase 3: Verify shadcn/ui Integration

**Step 3.1: Check components.json**

File: `components.json` (should exist at project root)

Required structure for 2026:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "src/styles/global.css",
    "css": "src/styles/global.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

**Step 3.2: Test existing components**

Check if you have shadcn components in `src/components/ui/`:
```bash
ls src/components/ui
```

Expected components: button.tsx, card.tsx, etc.

**Step 3.3: Add a test component (if needed)**

```bash
npx shadcn@latest add button
```

**Step 3.4: Verify in app**

Import and use a component:
```tsx
import { Button } from "@/components/ui/button";

<Button variant="default">Click me</Button>
```

**Time:** 10 minutes | **Risk:** Low

---

### Phase 4: Production Build Verification

**Step 4.1: Clean build**

```bash
npm run build
```

**Verify in `out/renderer/index.html`:**
```html
<link rel="stylesheet" crossorigin href="./assets/index-XYZ.css">
```

**Step 4.2: Check CSS bundle**

```bash
ls -lh out/renderer/assets/*.css
```

Expected size: ~50-100 KB (optimized)

**Step 4.3: Production test**

```bash
npm run package
cd dist/win-unpacked
electron-shadcn.exe
```

**Verify:**
- ✅ Styles load correctly
- ✅ All components styled
- ✅ Dark mode works
- ✅ Responsive layout works

**Time:** 15 minutes | **Risk:** Medium

---

## 🎨 Understanding Tailwind CSS v4 Changes (2025-2026)

### What Changed in Tailwind v4

**Old Way (v3):**
- `tailwind.config.js` configuration file
- `postcss.config.js` with PostCSS
- `@tailwind base; @tailwind components; @tailwind utilities;`

**New Way (v4):**
- CSS-first configuration (no config file needed for most projects)
- `@tailwindcss/vite` plugin (native Vite integration)
- Single `@import "tailwindcss";`
- CSS custom properties for theming
- `@theme` directive for custom theme
- Better performance (10x faster builds)

### Why This Matters for Electron

**Benefits:**
1. **Faster HMR** - Instant style updates in development
2. **Smaller bundles** - Only used utilities included
3. **CSS variables** - Dynamic theme switching (dark mode)
4. **Simpler setup** - No PostCSS config needed
5. **Better type safety** - TypeScript-first

**Migration Impact:**
- ✅ Project already uses Tailwind v4 syntax
- ✅ No migration needed, just plugin configuration
- ✅ Future-proof for 2026+

---

## 📚 Key Resources (Updated February 2026)

### Official Documentation

1. **[Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)** - Complete v4 reference
2. **[Tailwind CSS v4 Announcement Blog Post](https://tailwindcss.com/blog/tailwindcss-v4)** (January 2025)
3. **[@tailwindcss/vite Plugin Guide](https://tailwindcss.com/docs/installation/using-postcss)** - Vite-specific setup
4. **[shadcn/ui Official Documentation](https://ui.shadcn.com)** - Component library docs
5. **[shadcn/ui Vite Installation Guide](https://ui.shadcn.com/docs/installation/vite)** - Vite-specific steps

### Community Guides (2025-2026)

6. **[Electron-Vite + Tailwind-Shadcn UI Guide (Mohit's Blog)](https://blog.mohitnagaraj.in/blog/202505/Electron_Shadcn_Guide)** (May 20, 2025)
   - Comprehensive guide for Electron + Vite + Tailwind v4 + shadcn/ui
   - Covers path aliases and 2025 best practices

7. **[How to Add Shadcn/UI to an Electron-Vite App (Medium)](https://gbuszmicz.medium.com/how-to-add-shadcn-ui-to-an-electron-vite-app-in-5-easy-steps-cadfdf267823)** (May 3, 2025)
   - 5-step simplified approach
   - Start-from-scratch tutorial

8. **[Add ShadCN to electron-vite (DEV.to)](https://dev.to/nedwize/how-to-add-shadcn-to-an-electron-vite-project-dn)** (February 22, 2025)
   - TailwindCSS setup first, then shadcn/ui
   - Detailed configuration

9. **[Tailwind CSS in 2026 (LogRocket)](https://blog.logrocket.com/tailwind-css-guide/)** - Comprehensive 2026 guide

10. **[Tailwind v4 Migration Guide (DesignRevision)](https://designrevision.com/blog/tailwind-4-migration)** (January 2026)

### Video Tutorials

11. **[Setup Tailwind CSS + Vite (YouTube)](https://www.youtube.com/watch?v=5ix0kdb7OfM)** (June 2025)
12. **[Electron + Tailwind CSS + Vite (YouTube)](https://www.youtube.com/watch?v=5mcYCsU_mKo)** (October 2025)
13. **[Shadcn UI + Vite + React (YouTube)](https://www.youtube.com/watch?v=aMX_DYK5LAk)** (April 2025)

### GitHub Repositories

14. **[electron-shadcn Template (GitHub)](https://github.com/rohitsoni007/electron-shadcn)** - Production-ready template
15. **[electron-vite-template with Drizzle (GitHub)](https://github.com/renqiankun/electron-vite-template)** - Includes better-sqlite3

### Troubleshooting

16. **[Stack Overflow - electron-vite + Tailwind v4](https://stackoverflow.com/questions/79562593/electron-vite-react-tailwindcss-v4)** (April 2025)
17. **[Tailwind Labs GitHub Issue #18760](https://github.com/tailwindlabs/tailwindcss/issues/18760)** - Custom utilities bug (August 2025)
18. **[Chinese Blog - Electron 40 + Vue 3.5 + Vite 7 + Tailwind 4.1.18](https://www.cnblogs.com/jeyrlin/p/19515513)** (January 22, 2026)

---

## ✅ Success Criteria

Phase 1 (Tailwind Plugin):
- ✅ `@tailwindcss/vite` plugin configured in electron-vite
- ✅ Dev mode loads with styles
- ✅ Utility classes work in components

Phase 2 (Tailwind Features):
- ✅ CSS custom properties work
- ✅ Dark mode switching works
- ✅ Responsive utilities work
- ✅ Custom theme variables accessible

Phase 3 (shadcn/ui):
- ✅ components.json configured correctly
- ✅ Existing shadcn components render correctly
- ✅ New components can be added via CLI
- ✅ Component variants work (default, destructive, outline, etc.)

Phase 4 (Production):
- ✅ Build generates optimized CSS bundle
- ✅ Packaged app has all styles
- ✅ No visual regressions
- ✅ Performance acceptable

---

## 🔧 Troubleshooting Guide

### Issue 1: CSS still not loading after plugin configuration

**Symptoms:** Unstyled interface in dev

**Checks:**
```bash
# 1. Verify plugin import
cat electron.vite.config.ts | grep tailwindcss

# 2. Check for import errors
npm run dev 2>&1 | grep -i error

# 3. Verify CSS file exists
ls src/styles/global.css

# 4. Check renderer.ts imports
cat src/renderer.ts | grep global.css
```

**Solutions:**
- Restart dev server (Ctrl+C, then `npm run dev`)
- Clear cache: `rm -rf out node_modules/.vite`
- Verify `@tailwindcss/vite` is installed: `npm ls @tailwindcss/vite`

### Issue 2: Build fails with Tailwind errors

**Symptoms:** Build error mentioning Tailwind

**Common Error:**
```
Error: It looks like you're trying to use `@apply` with Tailwind v4
```

**Solution:**
This is expected in v4 - `@apply` works differently now. Use inline utilities or component variants.

### Issue 3: shadcn components don't work

**Symptoms:** Components render but unstyled

**Checks:**
```bash
# Verify components exist
ls src/components/ui

# Check components.json
cat components.json
```

**Solution:**
Re-run shadcn init:
```bash
npx shadcn@latest init
```

### Issue 4: Production build has no styles

**Symptoms:** exe launches unstyled

**Checks:**
```bash
# Verify CSS in build
ls out/renderer/assets/*.css

# Check file size (should be > 10 KB)
ls -lh out/renderer/assets/*.css
```

**Solution:**
1. Ensure `@tailwindcss/vite` plugin in renderer config
2. Clean rebuild: `rm -rf out && npm run build`
3. Rebuild native modules: `npm run rebuild && npm run build`

---

## 🎯 Quick Start (TL;DR)

**The Fix (3 lines of code):**

File: `electron.vite.config.ts`

```typescript
import tailwindcss from '@tailwindcss/vite';  // 1. Import

export default defineConfig({
  renderer: {
    plugins: [tailwindcss()],  // 2. Add to plugins
    // ... rest of config
  }
});
```

**That's it!** Run `npm run dev` and styles should work.

---

## 📝 Implementation Checklist

- [ ] Phase 1.1: Add `@tailwindcss/vite` import to electron-vite.config.ts
- [ ] Phase 1.2: Add `plugins: [tailwindcss()]` to renderer config
- [ ] Phase 1.3: Test `npm run dev` - verify styles load
- [ ] Phase 2.1: Test utility classes in a component
- [ ] Phase 2.2: Verify CSS custom properties work
- [ ] Phase 2.3: Test dark mode switching
- [ ] Phase 3.1: Verify `components.json` exists and is correct
- [ ] Phase 3.2: List existing shadcn components in `src/components/ui/`
- [ ] Phase 3.3: Test a shadcn component (e.g., Button)
- [ ] Phase 3.4: Add a new component via CLI (optional): `npx shadcn@latest add [component]`
- [ ] Phase 4.1: Run `npm run build` - check CSS bundle
- [ ] Phase 4.2: Run `npm run package` - create production build
- [ ] Phase 4.3: Test packaged exe - verify all styles work
- [ ] Documentation: Update README with Tailwind v4 setup instructions
- [ ] Git commit with message: "fix: configure @tailwindcss/vite plugin for electron-vite"

---

## 🚀 Next Steps After Integration

1. **Add Missing shadcn Components**
   ```bash
   npx shadcn@latest add dialog
   npx shadcn@latest add dropdown-menu
   npx shadcn@latest add table
   # ... add as needed
   ```

2. **Customize Theme**
   - Edit `src/styles/global.css` variables
   - Update colors, spacing, radius
   - Test in both light and dark modes

3. **Performance Optimization**
   - Use Tailwind's JIT (already included in v4)
   - Lazy load components if needed
   - Monitor CSS bundle size

4. **Accessibility**
   - Verify color contrast ratios
   - Test keyboard navigation
   - Use shadcn's accessible components

---

## 🎓 Key Learnings for 2026

1. **Tailwind CSS v4 is CSS-first** - Configure in CSS, not JavaScript
2. **@tailwindcss/vite is required** - Cannot use Tailwind v4 without it in Vite projects
3. **electron-vite needs separate configs** - Plugin only in renderer process
4. **shadcn/ui is not a package** - It's a CLI that copies component files
5. **CSS variables are the future** - Dynamic theming without rebuild
6. **Simpler is better** - Tailwind v4 removes config complexity

---

## 📊 Estimated Timeline

| Phase | Tasks | Time | Cumulative |
|-------|-------|------|------------|
| 1 | Configure Tailwind v4 plugin | 5 min | 5 min |
| 2 | Verify Tailwind features | 10 min | 15 min |
| 3 | Verify shadcn/ui integration | 10 min | 25 min |
| 4 | Production build verification | 15 min | 40 min |
| | **Total** | **40 min** | **40 min** |

**Actual work time:** ~10 minutes
**Testing and verification:** ~30 minutes

---

## 🎉 Conclusion

This integration plan addresses the critical CSS loading issue with a **single, focused fix**: adding the `@tailwindcss/vite` plugin to the electron-vite renderer configuration.

**Why this will work:**
1. ✅ All dependencies already installed (no npm install needed)
2. ✅ CSS file already uses Tailwind v4 syntax
3. ✅ CSS import already added to renderer.ts
4. ✅ Only missing piece: Vite plugin configuration

**Expected outcome:**
- Development mode: Fully styled interface with hot reload
- Production build: Optimized CSS bundle (~50 KB)
- shadcn/ui components: Working immediately
- Future-proof: Ready for Tailwind CSS updates in 2026+

**Risk assessment:** Very low - this is a standard configuration following official Tailwind CSS v4 documentation for Vite projects.

---

## 📞 Support

If issues arise after following this plan:
1. Check the [Troubleshooting Guide](#-troubleshooting-guide) section above
2. Consult [Key Resources](#-key-resources-updated-february-2026) for latest documentation
3. Verify electron-vite version: `npm ls electron-vite` (should be 5.0.0+)
4. Verify Tailwind version: `npm ls tailwindcss` (should be 4.1.18+)

**Last Updated:** February 16, 2026
**Document Version:** 1.0
