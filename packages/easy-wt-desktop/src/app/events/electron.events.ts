/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { environment } from '../../environments/environment';
import App from '../app';
import { join } from 'path';
import * as fs from 'fs-extra';
import { decryptedData, encryptedData } from '../tools';

import * as winston from 'winston';

export default class ElectronEvents {
  static windowMap = new Map<string, BrowserWindow>();

  static loggers = winston.loggers.get('logger');

  static bootstrapElectronEvents(): Electron.IpcMain {
    this.windowMap.set('main', App.mainWindow);
    return ipcMain;
  }
}

ipcMain.on('logger', (event, args) => {
  const [level, message, label] = args;
  if (label) {
    App.logger.log({ level, message, label });
  } else {
    App.logger.log({ level, message });
  }
});

// Retrieve app version
ipcMain.handle('get-app-version', (event) => {
  return environment.version;
});

ipcMain.handle('get-app-environment', (event) => {
  return app.isPackaged ? 'production' : 'development';
});
ipcMain.handle('get-app-path', (event) => {
  return app.getAppPath();
});
ipcMain.handle('get-userData-path', (event) => {
  return app.getPath('userData');
});

ipcMain.handle('get-path', (event, args) => {
  const [name] = args;
  return app.getPath(name);
});
/**
 * 加密数据
 */
ipcMain.handle('encryptedData', (event, args) => {
  const [data] = args;
  return encryptedData(data);
});
/**
 * 解密数据
 */
ipcMain.handle('decryptedData', (event, args) => {
  const [data] = args;
  return decryptedData(data);
});

ipcMain.handle('get-appData-path', (event) => {
  return app.getPath('appData');
});

ipcMain.handle('get-loadWeb-path', (event) => {
  return App.loadWebPath;
});
ipcMain.handle('get-loadReport-path', (event) => {
  return App.loadReportPath;
});
ipcMain.handle('get-main-LoadURL', (event, args) => {
  return App.loadURL;
});

/**
 * 新开一个窗口
 * [windowName 文件名, url 文件url, parent:是否子窗口, ...other:其他配置参数]
 */
ipcMain.handle('newWindow', async (event, args) => {
  const [windowName, url, parent, options] = args;

  const newWindow = new BrowserWindow(
    Object.assign(
      {
        parent: parent ? App.mainWindow : null,
        show: true,

        frame: true,
        webPreferences: {
          devTools: App.isDevelopmentMode(),
          nodeIntegration: true,
          contextIsolation: true,
          webSecurity: false,
          backgroundThrottling: false,
          preload: join(__dirname, 'main.preload.js'),
        },
      },
      options || {}
    )
  );
  newWindow.loadURL(url).then();
  ElectronEvents.windowMap.set(windowName, newWindow);
  newWindow.once('close', () => {
    ElectronEvents.windowMap.delete(windowName);
  });
  return new Promise((resolve, reject) => {
    newWindow.once('ready-to-show', () => {
      resolve(windowName);
    });
  });
});

/**
 * 获取pdf
 */
ipcMain.handle('saveToPDF', async (event, args) => {
  const [windowName, filePath, options] = args;
  let window: BrowserWindow;
  if (windowName) {
    window = ElectronEvents.windowMap.get(windowName);
  } else {
    window = App.mainWindow;
  }
  const buff = await window.webContents.printToPDF(options || {});
  await fs.writeFile(filePath, buff);
});

ipcMain.on('closeWindow', async (event, args) => {
  const [windowName] = args;
  if (windowName) {
    const window = ElectronEvents.windowMap.get(windowName);
    window && window.close();
  }
});

ipcMain.on('reload', async (event, args) => {
  const [windowName] = args;
  if (windowName) {
    const window = ElectronEvents.windowMap.get(windowName);
    window && window.reload();
  } else {
    App.application.relaunch();
  }
});

/**
 * 保存文件的弹框
 */
ipcMain.handle('showSaveDialog', async (event, args) => {
  const [options, windowName] = args;
  let window: BrowserWindow | null = null;
  if (windowName) {
    window = ElectronEvents.windowMap.get(windowName);
  }
  const result = await dialog.showSaveDialog(window, options);
  return result.filePath;
});

/**
 * 打开文件的弹窗
 */
ipcMain.handle('showOpenDialog', async (event, args) => {
  const [options, windowName] = args;
  let window: BrowserWindow | null = null;
  if (windowName) {
    window = ElectronEvents.windowMap.get(windowName);
  }
  const result = await dialog.showOpenDialog(window, options);
  return result.filePaths;
});

/**
 * 最大化窗口
 */
ipcMain.on('maximizeWindow', async (event, args) => {
  const [windowName] = args;
  let window: BrowserWindow;
  if (windowName) {
    window = ElectronEvents.windowMap.get(windowName);
  } else {
    window = App.mainWindow;
  }
  if (window) {
    // 似乎有个bug,需要两次调用isMaximized 才能检测到状态
    window.isMaximized();
    if (window.isMaximized()) {
      window.setSize(App.windowWidth, App.windowHeight, true);
      window.center();
    } else {
      window.maximize();
    }
  }
});

/**
 * 最小化窗口
 */
ipcMain.on('minimizeWindow', async (event, args) => {
  const [windowName] = args;
  let window: BrowserWindow;
  if (windowName) {
    window = ElectronEvents.windowMap.get(windowName);
  } else {
    window = App.mainWindow;
  }
  window && window.minimize();
});
ipcMain.on('toggleDevTools', (event, args) => {
  const [name] = args;
  if (name) {
    const windows = ElectronEvents.windowMap.get(name);
    windows && windows.webContents.toggleDevTools();
  } else {
    App.mainWindow.webContents.toggleDevTools();
  }
});


// Handle App termination
ipcMain.on('quit', (event, code) => {
  app.exit(code);
});
