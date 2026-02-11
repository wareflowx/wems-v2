# TanStack Router + Electron Template

A modern React template combining **TanStack Router** for web development with **Electron** for desktop applications. Built with TypeScript, Tailwind CSS, and Shadcn/ui components.

## Features

- **TanStack Router** - File-based routing with type-safe navigation
- **Electron** - Cross-platform desktop app support
- **vite-plugin-electron** - Seamless Electron integration with Vite
- **Tailwind CSS v4** - Modern utility-first styling
- **Shadcn/ui** - Beautiful, accessible component library
- **TypeScript** - End-to-end type safety
- **React 19** - Latest React features

## Quick Start

### Installation

```bash
pnpm install
```

### Web Development

Run the web version in development mode:

```bash
pnpm dev
```

The application will be available at `http://127.0.0.1:5555`

### Electron Development

Run the Electron desktop application:

```bash
pnpm electron:dev
```

This compiles both the web app and Electron processes, then launches the desktop application.

### Production Build

Build for web:

```bash
pnpm build
```

Build and package Electron app for distribution:

```bash
pnpm electron:build
```

This creates distributable packages in the `release/` directory for Windows, macOS, and Linux.

### Run Built Electron App

After building, run the packaged Electron app:

```bash
pnpm electron
```

## Project Structure

```
etst/
├── electron/
│   ├── main.ts           # Electron main process
│   └── preload.ts        # Preload script (IPC bridge)
├── src/
│   ├── components/       # React components
│   │   └── ui/          # Shadcn/ui components
│   ├── routes/          # File-based routes
│   ├── lib/             # Utility functions
│   ├── main.tsx         # React entry point
│   ├── router.tsx       # TanStack Router config
│   └── styles.css       # Global styles
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.ts       # Vite + Electron plugin config
└── package.json
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start web dev server on 127.0.0.1:5555 |
| `pnpm electron:dev` | Start Electron in development mode |
| `pnpm build` | Build for web production |
| `pnpm electron:build` | Build + package Electron app |
| `pnpm electron` | Run built Electron application |
| `pnpm test` | Run tests with Vitest |
| `pnpm lint` | Lint code with ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm check` | Format and lint all files |

## Configuration

### Electron

The Electron configuration is handled by `vite-plugin-electron` in `vite.config.ts`:

- **Main process**: `electron/main.ts` - Runs in Node.js environment
- **Preload script**: `electron/preload.ts` - Secure bridge between main and renderer
- **Renderer**: Uses the same TanStack Router app as web

### Network Configuration

Both web and Electron development servers run on `127.0.0.1:5555` to avoid network restrictions on localhost.

## Building for Distribution

The project uses **electron-builder** for packaging. Configuration is in `package.json` under the `build` field:

- **Windows**: NSIS installer (x64)
- **macOS**: DMG package (x64, arm64)
- **Linux**: AppImage (x64)

Build artifacts are created in the `release/` directory.

## Testing

This project uses [Vitest](https://vitest.dev/) for testing:

```bash
pnpm test
```

## Styling

### Tailwind CSS

This project uses [Tailwind CSS v4](https://tailwindcss.com/) for styling. The configuration is handled by the `@tailwindcss/vite` plugin.

### Shadcn/ui

Add new Shadcn components:

```bash
pnpm dlx shadcn@latest add [component-name]
```

Available components: https://ui.shadcn.com/

## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are defined in `src/routes/`:

- `src/routes/__root.tsx` - Root layout
- `src/routes/index.tsx` - Home page (/)
- Create new routes by adding files in `src/routes/`

### Navigation

Use the `Link` component for navigation:

```tsx
import { Link } from '@tanstack/react-router'

<Link to="/about">About</Link>
```

## Data Fetching

TanStack Router provides multiple ways to fetch data:

### Route Loaders

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts')({
  loader: async () => {
    const res = await fetch('https://api.example.com/posts')
    return res.json()
  },
  component: Posts
})
```

## IPC Communication (Electron)

The preload script exposes safe IPC methods to the renderer process:

```typescript
// Available in renderer via window.electronAPI
window.electronAPI.sendMessage('channel', data)
window.electronAPI.on('channel', callback)
window.electronAPI.invoke('channel', ...args)
```

## Learn More

- [TanStack Router Documentation](https://tanstack.com/router)
- [Electron Documentation](https://www.electronjs.org/docs)
- [vite-plugin-electron](https://github.com/electron-vite/vite-plugin-electron)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with TanStack Router and Electron
