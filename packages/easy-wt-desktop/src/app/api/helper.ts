import { ipcRenderer } from 'electron';
import path from 'path';

export interface Expose {
  expose: () => {
    [key: string]: unknown;
  };
}

export function sendLogger(level: string, message: string, label?: string) {
  ipcRenderer.send('logger', [level, message, label]);
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
