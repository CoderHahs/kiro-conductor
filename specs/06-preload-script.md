# Preload Script (IPC Security Bridge)

```typescript
// electron/preload.ts

import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  repo: {
    add: () => ipcRenderer.invoke('repo:add'),
    list: () => ipcRenderer.invoke('repo:list'),
    remove: (id: string) => ipcRenderer.invoke('repo:remove', id),
    configure: (id: string, config: any) =>
      ipcRenderer.invoke('repo:configure', id, config),
  },

  workspace: {
    create: (args: any) => ipcRenderer.invoke('workspace:create', args),
    list: (repoId: string) => ipcRenderer.invoke('workspace:list', repoId),
    get: (id: string) => ipcRenderer.invoke('workspace:get', id),
    archive: (id: string) => ipcRenderer.invoke('workspace:archive', id),
    restore: (id: string) => ipcRenderer.invoke('workspace:restore', id),
    delete: (id: string) => ipcRenderer.invoke('workspace:delete', id),
  },

  agent: {
    create: (wsId: string, args: any) =>
      ipcRenderer.invoke('agent:create', wsId, args),
    list: (wsId: string) => ipcRenderer.invoke('agent:list', wsId),
    start: (id: string) => ipcRenderer.invoke('agent:start', id),
    stop: (id: string) => ipcRenderer.invoke('agent:stop', id),
    delete: (id: string) => ipcRenderer.invoke('agent:delete', id),
  },

  script: {
    run: (wsId: string, type: string) =>
      ipcRenderer.invoke('script:run', wsId, type),
    stop: (wsId: string) => ipcRenderer.invoke('script:stop', wsId),
  },

  diff: {
    get: (wsId: string) => ipcRenderer.invoke('diff:get', wsId),
    approve: (wsId: string, files: string[]) =>
      ipcRenderer.invoke('diff:approve', wsId, files),
  },
```

pr: {
create: (wsId: string, options: any) =>
ipcRenderer.invoke('pr:create', wsId, options),
merge: (wsId: string) => ipcRenderer.invoke('pr:merge', wsId),
status: (wsId: string) => ipcRenderer.invoke('pr:status', wsId),
},

file: {
openInEditor: (path: string) =>
ipcRenderer.invoke('file:open-in-editor', path),
openFolder: (path: string) =>
ipcRenderer.invoke('file:open-folder', path),
},

dialog: {
confirm: (options: any) => ipcRenderer.invoke('dialog:confirm', options),
error: (title: string, message: string) =>
ipcRenderer.invoke('dialog:error', title, message),
},

settings: {
get: (key: string) => ipcRenderer.invoke('settings:get', key),
set: (key: string, value: any) =>
ipcRenderer.invoke('settings:set', key, value),
getAll: () => ipcRenderer.invoke('settings:getAll'),
},

getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),

on: (channel: string, listener: any) => {
const validChannels = [
'workspace:updated',
'agent:updated',
'terminal:output',
'script:done',
];
if (validChannels.includes(channel)) {
ipcRenderer.on(channel, listener);
}
},

off: (channel: string, listener: any) => {
ipcRenderer.off(channel, listener);
},
};

contextBridge.exposeInMainWorld('electron', electronAPI);

declare global {
interface Window {
electron: typeof electronAPI;
}
}

```

```
