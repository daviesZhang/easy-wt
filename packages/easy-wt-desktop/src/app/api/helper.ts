import { ipcRenderer } from 'electron';
import path from 'path';
import { EventEmitter } from 'events';
import { LOG_EVENT_NAME } from '@easy-wt/common';

export const commonEventEmitter = new EventEmitter();
export interface Expose {
  expose: () => {
    [key: string]: unknown;
  };
}

export function sendLogger(level: string, message: string, label?: string) {
  ipcRenderer.send('logger', [level, message, label]);
  commonEventEmitter.emit(LOG_EVENT_NAME, {
    level,
    message,
    label,
    time: new Date().getTime(),
  });
}

/**
 * 获取环境配置文件路径
 */
export async function getEnvFilePath(): Promise<string> {
  const userDataPath = await ipcRenderer.invoke('get-path', ['userData']);
  return path.join(userDataPath, 'environment.env');
}

export async function getMainWindowLoadURL(): Promise<string> {
  return await ipcRenderer.invoke('get-main-LoadURL');
}
