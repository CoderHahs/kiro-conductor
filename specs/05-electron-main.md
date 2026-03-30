# Electron Main Process + IPC Handlers

```typescript
// electron/main.ts

import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  dialog,
  shell,
} from 'electron';
import isDev from 'electron-is-dev';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import { fileURLToPath } from 'url';
import { BackendService } from './backend/service.js';
import { createMenu } from './menu.js';
import { WindowManager } from './window-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let backend: BackendService | null = null;
const windowManager = new WindowManager();

// ─────────────────────────────────────────────────────────
// App Lifecycle
// ─────────────────────────────────────────────────────────

app.on('ready', async () => {
  try {
    // Start backend service
    backend = new BackendService();
    await backend.start(3333);

    // Create main window
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        sandbox: true,
        nodeIntegration: false,
        contextIsolation: true,
```

        enableRemoteModule: false,
      },
      icon: path.join(__dirname, '../build/icon.png'),
    });

    windowManager.register(mainWindow);

    // Load URL
    const url = isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../dist/index.html')}`;

    mainWindow.loadURL(url);

    if (isDev) {
      mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    // Setup menu
    const menu = createMenu(mainWindow);
    Menu.setApplicationMenu(menu);

    // Setup IPC handlers
    setupIPC(backend);

    // Check for updates
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    }

} catch (error) {
console.error('Failed to start app:', error);
dialog.showErrorBox(
'Startup Error',
'Failed to start Kiro-Conductor. Please try again.'
);
app.quit();
}
});

app.on('window-all-closed', () => {
if (process.platform !== 'darwin') {
app.quit();
}
});

app.on('activate', () => {
if (mainWindow === null) {
app.emit('ready');
}
});

app.on('before-quit', async () => {
if (backend) {
await backend.stop();
}
});

// ─────────────────────────────────────────────────────────
// IPC Handlers
// ─────────────────────────────────────────────────────────

function setupIPC(backend: BackendService) {
// Repository handlers
ipcMain.handle('repo:add', async (event, args) => {
const result = await dialog.showOpenDialog(mainWindow!, {
properties: ['openDirectory'],
});

    if (!result.canceled) {
      return backend.addRepository(result.filePaths[0]);
    }

});

ipcMain.handle('repo:list', async () => {
return backend.listRepositories();
});

ipcMain.handle('repo:remove', async (event, repoId) => {
return backend.removeRepository(repoId);
});

ipcMain.handle('repo:configure', async (event, repoId, config) => {
return backend.updateRepository(repoId, config);
});

// Workspace handlers
ipcMain.handle('workspace:create', async (event, args) => {
return backend.createWorkspace(args);
});

ipcMain.handle('workspace:list', async (event, repoId) => {
return backend.listWorkspaces(repoId);
});

ipcMain.handle('workspace:get', async (event, workspaceId) => {
return backend.getWorkspace(workspaceId);
});

ipcMain.handle('workspace:archive', async (event, workspaceId) => {
return backend.archiveWorkspace(workspaceId);
});

ipcMain.handle('workspace:restore', async (event, workspaceId) => {
return backend.restoreWorkspace(workspaceId);
});

ipcMain.handle('workspace:delete', async (event, workspaceId) => {
return backend.deleteWorkspace(workspaceId);
});

// Agent handlers
ipcMain.handle('agent:create', async (event, workspaceId, args) => {
return backend.createAgent(workspaceId, args);
});

ipcMain.handle('agent:list', async (event, workspaceId) => {
return backend.listAgents(workspaceId);
});

ipcMain.handle('agent:start', async (event, agentId) => {
return backend.startAgent(agentId);
});

ipcMain.handle('agent:stop', async (event, agentId) => {
return backend.stopAgent(agentId);
});

ipcMain.handle('agent:delete', async (event, agentId) => {
return backend.deleteAgent(agentId);
});

// Script handlers
ipcMain.handle('script:run', async (event, workspaceId, scriptType) => {
return backend.executeScript(workspaceId, scriptType);
});

ipcMain.handle('script:stop', async (event, workspaceId) => {
return backend.stopScript(workspaceId);
});

// Diff handlers
ipcMain.handle('diff:get', async (event, workspaceId) => {
return backend.getDiff(workspaceId);
});

ipcMain.handle('diff:approve', async (event, workspaceId, files) => {
return backend.approveDiff(workspaceId, files);
});

// PR handlers
ipcMain.handle('pr:create', async (event, workspaceId, options) => {
return backend.createPR(workspaceId, options);
});

ipcMain.handle('pr:merge', async (event, workspaceId) => {
return backend.mergePR(workspaceId);
});

ipcMain.handle('pr:status', async (event, workspaceId) => {
return backend.getPRStatus(workspaceId);
});

// File handlers
ipcMain.handle('file:open-in-editor', async (event, filePath) => {
return shell.openPath(filePath);
});

ipcMain.handle('file:open-folder', async (event, folderPath) => {
return shell.openPath(folderPath);
});

// Dialog handlers
ipcMain.handle('dialog:confirm', async (event, options) => {
const result = await dialog.showMessageBox(mainWindow!, {
type: 'question',
buttons: ['Cancel', 'OK'],
...options,
});
return result.response === 1;
});

ipcMain.handle('dialog:error', async (event, title, message) => {
return dialog.showErrorBox(title, message);
});

// Settings handlers
ipcMain.handle('settings:get', async (event, key) => {
return backend.getSetting(key);
});

ipcMain.handle('settings:set', async (event, key, value) => {
return backend.setSetting(key, value);
});

ipcMain.handle('settings:getAll', async () => {
return backend.getAllSettings();
});

// Backend URL
ipcMain.handle('get-backend-url', () => {
return 'http://localhost:3333';
});
}

// ─────────────────────────────────────────────────────────
// Keyboard Shortcuts
// ─────────────────────────────────────────────────────────

app.on('ready', () => {
// Global shortcuts
// Add global shortcuts here if needed
});

```

```
