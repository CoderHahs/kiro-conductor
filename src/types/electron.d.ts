export interface ElectronAPI {
  repo: {
    add: () => Promise<any>;
    list: () => Promise<any>;
    remove: (id: string) => Promise<any>;
    configure: (id: string, config: any) => Promise<any>;
  };
  workspace: {
    create: (args: any) => Promise<any>;
    list: (repoId: string) => Promise<any>;
    get: (id: string) => Promise<any>;
    archive: (id: string) => Promise<any>;
    restore: (id: string) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };
  agent: {
    create: (wsId: string, args: any) => Promise<any>;
    list: (wsId: string) => Promise<any>;
    start: (id: string) => Promise<any>;
    stop: (id: string) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };
  script: {
    run: (wsId: string, type: string) => Promise<any>;
    stop: (wsId: string) => Promise<any>;
  };
  diff: {
    get: (wsId: string) => Promise<any>;
    approve: (wsId: string, files: string[]) => Promise<any>;
  };
  pr: {
    create: (wsId: string, options: any) => Promise<any>;
    merge: (wsId: string) => Promise<any>;
    status: (wsId: string) => Promise<any>;
  };
  file: {
    openInEditor: (path: string) => Promise<any>;
    openFolder: (path: string) => Promise<any>;
  };
  dialog: {
    confirm: (options: any) => Promise<boolean>;
    error: (title: string, message: string) => Promise<any>;
  };
  settings: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<any>;
    getAll: () => Promise<any>;
  };
  getBackendUrl: () => Promise<string>;
  on: (channel: string, listener: any) => void;
  off: (channel: string, listener: any) => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
