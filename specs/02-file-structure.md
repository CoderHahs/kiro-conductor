# File Structure

```
kiro-conductor/
├── electron/
│   ├── main.ts                      # Electron main process entry
│   ├── preload.ts                   # IPC security bridge
│   ├── menu.ts                      # Application menu
│   ├── window-manager.ts            # Window lifecycle management
│   ├── backend/
│   │   ├── service.ts               # Backend service manager
│   │   ├── workspace-manager.ts     # Workspace CRUD & lifecycle
│   │   ├── agent-orchestrator.ts    # Agent spawning & management
│   │   ├── git-handler.ts           # Git operations wrapper
│   │   ├── script-executor.ts       # Script execution engine
│   │   ├── database.ts              # SQLite wrapper
│   │   ├── api-routes.ts            # Express route definitions
│   │   └── websocket-server.ts      # Socket.io event handlers
│   └── utils/
│       ├── logger.ts                # Winston logging
│       ├── config.ts                # Configuration management
│       ├── constants.ts             # Shared constants
│       └── process-manager.ts       # Process lifecycle
│
├── src/
│   ├── components/
│   │   ├── ui/                      # Shadcn/ui primitives (button, card, dialog, input, select, badge, tabs, toast)
│   │   ├── Sidebar.tsx
│   │   ├── MainContent.tsx
│   │   ├── RepositoriesList.tsx
│   │   ├── RepositoryCard.tsx
│   │   ├── WorkspaceDashboard.tsx
│   │   ├── WorkspaceHeader.tsx
│   │   ├── AgentsPanel.tsx
│   │   ├── AgentCard.tsx
│   │   ├── AgentStatus.tsx
│   │   ├── ChatPanel.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   ├── TerminalPanel.tsx
│   │   ├── ActivityPanel.tsx
│   │   ├── DiffViewer.tsx
│   │   ├── DiffFileTree.tsx
│   │   ├── DiffEditor.tsx
│   │   ├── Dialogs/                 # CreateRepositoryDialog, CreateWorkspaceDialog, CreateAgentDialog, CreatePRDialog, ConfirmDialog
│   │   └── Settings/                # SettingsDialog, GeneralSettings, RepositorySettings, KeyboardSettings
│   │
│   ├── hooks/                       # useWorkspace, useAgents, useRepository, useTerminal, useWebSocket, useTheme, useSettings
│   ├── store/                       # workspaceStore, uiStore, settingsStore, notificationStore (Zustand)
│   ├── types/                       # workspace.ts, agent.ts, repository.ts, api.ts, ui.ts
│   ├── contexts/                    # ThemeContext, ElectronContext, NotificationContext, SettingsContext
│   ├── utils/                       # formatting, validation, api-client, websocket-client, errors
│   ├── styles/                      # globals.css, themes.css, animations.css
│   ├── App.tsx
│   └── main.tsx
│
├── public/icons/                    # icon.png, icon.icns, icon.ico
├── build/                           # Electron builder assets
├── __tests__/                       # unit/, integration/, e2e/
├── .github/workflows/               # test.yml, build.yml, release.yml
├── electron-builder.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── jest.config.js
└── .env.example
```
