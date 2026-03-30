# Kiro-Conductor Desktop — Project Overview

**Version**: 1.0 | **Date**: March 22, 2026

## What We're Building

Cross-platform desktop app that orchestrates Kiro-CLI AI agents working in parallel on isolated workspace branches.

- **Platform**: Windows, macOS, Linux
- **Tech**: Electron 27+ / React 18 / TypeScript 5 / Node.js
- **Agent Engine**: Kiro-CLI
- **Backend**: Express + SQLite + Socket.io
- **UI**: React + Tailwind CSS + Shadcn/ui
- **Build**: Vite + esbuild + electron-builder

## User Workflow

1. Add Repository
2. Create Workspace (isolated git branch)
3. Create Agents (parallel Kiro-CLI instances)
4. Chat with Agents (interactive development)
5. Review Changes (diff viewer)
6. Create PR (GitHub integration)
7. Merge & Archive (cleanup)

## Architecture

```
Renderer (React) → IPC → Main Process (Electron) → HTTP/WS → Backend (Express)
                                                                  ↓
                                                    Kiro-CLI | Git/GH | SQLite | FileSystem
```

## Spec Files Index

| File                           | Contents                               |
| ------------------------------ | -------------------------------------- |
| `01-package-json.md`           | Dependencies and scripts               |
| `02-file-structure.md`         | Complete directory layout              |
| `03-database-schema.md`        | SQLite schema (all tables)             |
| `04-type-definitions.md`       | TypeScript interfaces                  |
| `05-electron-main.md`          | Electron main process + IPC handlers   |
| `06-preload-script.md`         | IPC security bridge                    |
| `07-backend-service.md`        | Express BackendService class           |
| `08-react-components.md`       | React component specs                  |
| `09-api-routes.md`             | All REST endpoints                     |
| `10-websocket-events.md`       | Socket.io event handlers               |
| `11-design-system.md`          | Theme CSS variables + base styles      |
| `12-testing-and-deployment.md` | Test strategy + CI/CD + release config |
