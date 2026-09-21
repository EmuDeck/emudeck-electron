import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

contextBridge.exposeInMainWorld('backend', {
  message: (callback) => {
    const handler = (_event, line) => callback(line);
    ipcRenderer.on('backend-log', handler);
    return () => ipcRenderer.removeListener('backend-log', handler);
  },
});

contextBridge.exposeInMainWorld('electron', {
  // Real OS platform ('darwin' | 'win32' | 'linux'), not affected by fakeOS
  platform: process.platform,
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
});
