import { ipcRenderer } from 'electron';

export interface Expose {
  expose: () => {
    [key: string]: unknown;
  };
}

export function sendLogger(level: string, message: string, label?: string) {
  ipcRenderer.send('logger', [level, message, label]);
}
