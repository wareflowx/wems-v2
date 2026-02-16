# Tailwind CSS v4 with Vite: Complete Integration Guide (2026)

**Last Updated:** February 16, 2026
**Tailwind CSS Version:** 4.1.18
**Vite Version:** 7.3.1
**Status:** Production Ready

---

## Table of Contents

1. [What's New in Tailwind CSS v4](#whats-new-in-tailwind-css-v4)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Integration with Vite](#integration-with-vite)
5. [Integration with electron-vite](#integration-with-electron-vite)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Best Practices](#best-practices)
8. [Migration from v3](#migration-from-v3)

---

## What's New in Tailwind CSS v4

### Major Changes from v3

| Aspect | Tailwind v3 | Tailwind v4 |
|--------|------------|------------|
| **Config File** | `tailwind.config.js` | CSS-first (no JS config needed) |
| **Build Tool** | PostCSS | Native Vite plugin |
| **Installation** | Multiple packages | Single package |
| **CSS Variables** | Optional | Default (CSS-first) |
| **Performance** | Fast | **10x faster** ⚡ |
| **Theme** | JavaScript object | CSS custom properties |
| **Syntax** | `@tailwind` directives | `@import "tailwindcss"` |

### Key Features

1. **CSS-First Configuration**
   ```css
   /* No more tailwind.config.js! */
   @import "tailwindcss";

   @theme {
     --font-sans: "Geist", sans-serif;
     --color-primary: oklch(0.5 0.2 264);
   }
   ```

2. **Native Vite Plugin**
   ```typescript
   import tailwindcss from '@tailwindcss/vite';

   export default {
     plugins: [tailwindcss()]
   }
   ```

3. **Built-in CSS Variables**
   ```css
   :root {
     --background: oklch(1 0 0);
     --foreground: oklch(0.145 0 0);
   }
   ```

4. **Better Dark Mode**
   ```css
   .dark {
     --background: oklch(0.145 0 0);
     --foreground: oklch(0.985 0 0);
   }
   ```

---

## Installation

### For Vite Projects

```bash
npm install tailwindcss @tailwindcss/vite
```

**Two packages:**
- `tailwindcss` - Core Tailwind CSS engine
- `@tailwindcss/vite` - Official Vite plugin

### For electron-vite Projects

```bash
npm install tailwindcss @tailwindcss/vite
```

Same packages, but configuration goes in `electron.vite.config.ts` renderer section.

### Optional Dependencies

```bash
# Common additional packages
npm install tw-animate-css          # Animations
npm install tailwind-merge          # Merge utility classes
npm install clsx                    # Conditional classes
npm install class-variance-authority # Component variants
```

---

## Configuration

### Minimal Setup

**1. Create CSS file** (`src/styles/global.css`):

```css
@import "tailwindcss";
```

**2. Import in JavaScript** (`src/main.tsx` or `src/renderer.ts`):

```typescript
import "@/styles/global.css";
```

**3. Configure Vite** (`vite.config.ts`):

```typescript
import tailwindcss from '@tailwindcss/vite';

export default {
  plugins: [tailwindcss()]
}
```

That's it! No more configuration files needed.

### Full Featured Setup

**`src/styles/global.css`:**

```css
@import "tailwindcss";
@import "tw-animate-css";  /* Optional animations */

/* Font imports */
@import "@fontsource-variable/geist";
@import "@fontsource-variable/geist-mono";

/* Custom variant */
@custom-variant dark (&:is(.dark *));

/* Theme variables with CSS custom properties */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.58 0.22 27);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.87 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.371 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}

/* Inline theme configuration */
@theme inline {
  --font-sans: "Geist", sans-serif;
  --font-mono: "Geist Mono", monospace;

  /* Map CSS variables to Tailwind utilities */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  /* Radius utilities */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
}

/* Base layer styles */
@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground overflow-hidden font-sans antialiased;
  }

  html {
    @apply font-sans;
  }
}
```

---

## Integration with Vite

### Standard Vite Configuration

**`vite.config.ts`:**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()  // Add Tailwind plugin
  ],
  // ... other config
});
```

### With Additional Plugins

```typescript
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss()  // Order doesn't matter
  ]
});
```

**Note:** Plugin order is not important in Tailwind v4.

---

## Integration with electron-vite

### The Challenge

electron-vite has **three separate processes** (main, preload, renderer), but Tailwind CSS is only needed in the **renderer process** (UI layer).

### Configuration

**`electron.vite.config.ts`:**

```typescript
import { defineConfig } from 'electron-vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Main process (Node.js backend)
  main: {
    // No Tailwind needed here
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/main.ts'),
        external: ['better-sqlite3']
      }
    }
  },

  // Preload scripts (bridge)
  preload: {
    // No Tailwind needed here
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/preload.ts')
      }
    }
  },

  // Renderer process (UI layer - Tailwind goes here!)
  renderer: {
    root: '.',
    server: {
      host: '127.0.0.1',
      port: 5173
    },
    plugins: [
      tailwindcss()  // ⭐ ONLY in renderer config
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

### Critical Points

1. **ONLY in renderer config**
   - Main process doesn't need CSS
   - Preload scripts don't need CSS
   - Only the UI layer needs Tailwind

2. **Import CSS in renderer**
   ```typescript
   // src/renderer.ts
   import "@/styles/global.css";  // Required!
   import "@/app";
   ```

3. **Use correct dev server host**
   ```typescript
   server: {
     host: '127.0.0.1',  // More reliable than localhost
     port: 5173
   }
   ```

---

## Common Issues & Solutions

### Issue 1: CSS Not Loading

**Symptom:** App launches but interface is completely unstyled

**Root Cause 1:** CSS not imported in JavaScript
```typescript
// ❌ Missing import
// import "@/styles/global.css";

// ✅ Correct
import "@/styles/global.css";
```

**Root Cause 2:** Plugin not configured
```typescript
// ❌ Missing plugin
export default {
  // no plugins
}

// ✅ Correct
import tailwindcss from '@tailwindcss/vite';
export default {
  plugins: [tailwindcss()]
}
```

**Root Cause 3:** Wrong process config in electron-vite
```typescript
// ❌ Plugin in main process (wrong!)
main: {
  plugins: [tailwindcss()]
}

// ✅ Plugin in renderer process (correct!)
renderer: {
  plugins: [tailwindcss()]
}
```

### Issue 2: Utilities Not Working

**Symptom:** Some classes work, others don't

**Root Cause:** Old build cache

**Solution:**
```bash
# Clear cache and rebuild
rm -rf out/
rm -rf node_modules/.vite
npm run dev
```

### Issue 3: Custom Properties Not Working

**Symptom:** `bg-background` classes don't work

**Root Cause:** CSS variables not mapped to theme

**Solution:**
```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... map all variables */
}
```

### Issue 4: Dark Mode Not Switching

**Symptom:** Dark mode classes don't apply

**Root Cause 1:** Missing `.dark` class on parent

**Solution:**
```typescript
// Add dark class to html or body element
document.documentElement.classList.add('dark');
```

**Root Cause 2:** Dark mode variables not defined

**Solution:**
```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... all dark mode variables */
}
```

### Issue 5: Build Size Too Large

**Symptom:** CSS bundle is 1MB+ instead of ~50KB

**Root Cause:** Unused utilities not removed

**Solution:** Tailwind v4 JIT is enabled by default. Check if:

```typescript
// Ensure build mode is production
process.env.NODE_ENV === 'production'  // Should be true

// Check if minification is enabled
build: {
  minify: 'terser'  // Should be enabled
}
```

---

## Best Practices

### 1. CSS-First Configuration

**❌ Don't create `tailwind.config.js`:**
```javascript
// Old way (v3) - DON'T DO THIS
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#blue'
      }
    }
  }
}
```

**✅ Use CSS configuration:**
```css
/* New way (v4) - DO THIS */
@theme {
  --color-primary: oklch(0.5 0.2 264);
}
```

### 2. Use OKLCH Color Space

**Why OKLCH?**
- Perceptually uniform
- Wider gamut than RGB/HSL
- Better color mixing
- Modern standard

```css
/* ✅ Preferred */
--color-primary: oklch(0.5 0.2 264);

/* ❌ Avoid */
--color-primary: #3b82f6;
```

### 3. Import CSS in JavaScript

**❌ Don't link CSS in HTML:**
```html
<!-- DON'T DO THIS -->
<link rel="stylesheet" href="/src/styles/global.css">
```

**✅ Import in JS:**
```typescript
// DO THIS
import "@/styles/global.css";
```

**Why:** Vite needs to process CSS through its pipeline.

### 4. Use CSS Variables for Theming

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

**Benefits:**
- Dynamic theme switching without rebuild
- Better performance
- Easier customization

### 5. Organize with Layers

```css
@layer base {
  /* Base styles (body, html, etc.) */
}

@layer components {
  /* Reusable components */
}

@layer utilities {
  /* Custom utilities */
}
```

### 6. Use Component Variants

**With `class-variance-authority`:**

```typescript
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground"
      }
    }
  }
);
```

---

## Advanced Configuration

### Custom Utilities

```css
@theme {
  /* Custom spacing scale */
  --spacing-sidebar: 16rem;

  /* Custom breakpoints */
  --breakpoint-sm: 40rem;
  --breakpoint-md: 48rem;
  --breakpoint-lg: 64rem;
}
```

### Extending the Theme

```css
@import "tailwindcss";

@theme {
  /* Custom colors */
  --color-brand: oklch(0.7 0.15 200);

  /* Custom fonts */
  --font-display: "Display", sans-serif;

  /* Custom animations */
  --animation-fade-in: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Plugin Configuration

**If you need a `tailwind.config.js`:**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      // Only use for things that CAN'T be done in CSS
    }
  },
  plugins: [
    // Add Tailwind plugins here
  ]
}
```

**Note:** Most configuration can now be done in CSS!

---

## Migration from v3

### Step 1: Update Dependencies

```bash
npm uninstall tailwindcss postcss autoprefixer
npm install tailwindcss @tailwindcss/vite
```

### Step 2: Delete Old Config

```bash
rm tailwind.config.js
rm postcss.config.js
```

### Step 3: Update CSS

**Before (v3):**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* your base styles */
}

@layer components {
  /* your components */
}

@layer utilities {
  /* your utilities */
}
```

**After (v4):**
```css
@import "tailwindcss";

@layer base {
  /* your base styles */
}

@layer components {
  /* your components */
}

@layer utilities {
  /* your utilities */
}
```

### Step 4: Convert Theme

**Before (v3):**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b'
      }
    }
  }
}
```

**After (v4):**
```css
/* global.css */
@theme {
  --color-primary: oklch(0.6 0.2 264);
  --color-secondary: oklch(0.5 0.05 264);
}
```

### Step 5: Update Vite Config

**Before (v3):**
```typescript
// vite.config.ts - NO plugin needed!
export default {
  // PostCSS handled it automatically
}
```

**After (v4):**
```typescript
// vite.config.ts - Plugin REQUIRED!
import tailwindcss from '@tailwindcss/vite';

export default {
  plugins: [tailwindcss()]
}
```

### Migration Checklist

- [ ] Update dependencies
- [ ] Delete `tailwind.config.js`
- [ ] Delete `postcss.config.js`
- [ ] Update CSS imports (`@tailwind` → `@import`)
- [ ] Convert theme to CSS
- [ ] Add `@tailwindcss/vite` plugin to Vite config
- [ ] Update `package.json` scripts if needed
- [ ] Test all components
- [ ] Test dark mode
- [ ] Test responsive classes
- [ ] Check build size

---

## Performance Tips

### 1. Enable Purging (Default in v4)

Tailwind v4 uses JIT mode by default, which only generates the CSS you actually use.

**Verify it's working:**
```bash
npm run build
# Check CSS bundle size (should be ~50KB)
```

### 2. Use CSS Variables

```css
/* ✅ Efficient */
:root {
  --primary: oklch(0.5 0.2 264);
}
```

### 3. Avoid Dynamic Classes

```typescript
// ❌ Bad - Full scan needed
const className = `bg-${color}-500`;

// ✅ Good - Static classes
const variants = {
  blue: "bg-blue-500",
  red: "bg-red-500"
};
const className = variants[color];
```

### 4. Use Content Queries

```css
@layer components {
  .card {
    @apply bg-card text-card-foreground p-6 rounded-lg;
  }
}
```

---

## Troubleshooting

### Check Plugin Installation

```bash
npm ls @tailwindcss/vite
```

Should show version `^4.1.18` or higher.

### Validate Configuration

```typescript
// vite.config.ts or electron.vite.config.ts
import tailwindcss from '@tailwindcss/vite';

console.log('Tailwind plugin:', tailwindcss);
```

### Test CSS Processing

Create test file:

```css
/* test.css */
@import "tailwindcss";

.test {
  @apply bg-blue-500 text-white;
}
```

Import and check if styles apply.

### Clear All Caches

```bash
rm -rf out/
rm -rf node_modules/.vite
rm -rf dist/
npm run dev
```

---

## Resources

### Official Documentation
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [v4.0 Announcement](https://tailwindcss.com/blog/tailwindcss-v4)
- [@tailwindcss/vite Plugin Guide](https://tailwindcss.com/docs/installation/using-postcss)

### Community
- [Tailwind CSS GitHub](https://github.com/tailwindlabs/tailwindcss)
- [Tailwind CSS Discord](https://tailwindcss.com/discord)

### Tools
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) - VS Code extension
- [Tailwind Cheat Sheet](https://tailwindcomponents.com/cheatsheet/)

### Color Tools
- [OKLCH Color Picker](https://oklch.com)
- [Tailwind Colors Reference](https://tailwindcss.com/docs/customizing-colors)

---

**Last Updated:** February 16, 2026
**Tailwind CSS Version:** 4.1.18
**Document Version:** 1.0
