# ORPC Best Practices Overview

This document provides best practices for using ORPC (Object RPC) in this Electron application.

## Why ORPC?

ORPC provides:
- **Type-safety**: End-to-end TypeScript support
- **Performance**: MessagePort-based communication is faster than traditional IPC
- **Simplicity**: Clean, function-like API
- **Validation**: Built-in input/output validation with Zod

## Architecture Overview

```
┌─────────────────┐      MessagePort       ┌─────────────────┐
│   Renderer      │ ◄─────────────────────► │     Main        │
│                 │                        │                 │
│  ORPC Client   │    webContents.send    │  RPCHandler     │
│  (RPCLink)     │ ◄─────────────────────► │  (with router) │
└─────────────────┘                        └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Preload       │
│                 │
│  Bridge/Tunnel  │
│  (Minimal API)  │
└─────────────────┘
```

## Key Principles

1. **Minimal Preload**: Only expose tunnel APIs, not database functions
2. **Event-Driven**: Use events, not polling, for port transfer
3. **Contract-First**: Define interfaces before implementation
4. **Error Handling**: Centralized error interceptors
5. **Context**: Use context for dependency injection

## Quick Links

- [Setup Guide](./setup.md)
- [Electron Integration](./electron-integration.md)
- [Error Handling](./error-handling.md)
- [Contract-First Development](./contracts.md)
- [Context & DI](./context.md)
- [Troubleshooting](./troubleshooting.md)
