import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs-extra';

export interface WindowViewport {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface Store {
  [windowName: string]: WindowViewport;
}

function getStorePath() {
  const userData = app.getPath('userData');
  return path.join(userData, 'config.json');
}

export async function getStore(): Promise<Store | null> {
  const json = getStorePath();
  if (await fs.pathExists(json)) {
    try {
      return (await fs.readJSON(json)) as Store;
    } catch (e) {
      return null;
    }
  }
  return null;
}

export async function getWindowViewport(
  windowName: string
): Promise<WindowViewport | null> {
  const store = await getStore();
  if (!store) {
    return null;
  }
  return store[windowName];
}

export async function saveWindowViewport(
  windowName: string,
  viewport: Partial<WindowViewport>
): Promise<void> {
  const store = (await getStore()) || {};
  store[windowName] = Object.assign({}, store[windowName], viewport);
  await fs.writeJSON(getStorePath(), store);
}
