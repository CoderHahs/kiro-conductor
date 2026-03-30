import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // empty contextBridge setup
});