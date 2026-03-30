import { BrowserWindow } from 'electron';

export class WindowManager {
  private windows: Set<BrowserWindow> = new Set();

  register(window: BrowserWindow) {
    this.windows.add(window);
    window.on('closed', () => {
      this.windows.delete(window);
    });
  }

  getWindows() {
    return Array.from(this.windows);
  }
}
