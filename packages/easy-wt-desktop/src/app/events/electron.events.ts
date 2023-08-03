/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import {
  app,
  BrowserView,
  BrowserWindow,
  dialog,
  ipcMain,
  shell,
} from 'electron';
import { environment } from '../../environments/environment';
import App from '../app';
import { join } from 'path';
import { decryptedData, encryptedData } from '../tools';

import { getWindowViewport, saveWindowViewport } from '../store';
import {
  BROWSER_VIEW_NAME_PREFIX,
  ELECTRON_IPC_EVENT,
  MAIN_WINDOW_NAME,
} from '@easy-wt/common';

export default class ElectronEvents {
  static windowMap = new Map<string, BrowserWindow>();
  static viewWindowMap = new Map<string, BrowserView>();

  static bootstrapElectronEvents(): Electron.IpcMain {
    ElectronEvents.windowMap.set(MAIN_WINDOW_NAME, App.mainWindow);
    return ipcMain;
  }
}

function getWindows(name: string) {
  if (!name || name === MAIN_WINDOW_NAME) {
    return App.mainWindow;
  } else {
    return ElectronEvents.windowMap.get(name);
  }
}

function getWebContents(windowName: string) {
  let window: BrowserWindow | BrowserView;
  if (windowName.startsWith(BROWSER_VIEW_NAME_PREFIX)) {
    window = ElectronEvents.viewWindowMap.get(windowName);
  } else {
    window = getWindows(windowName);
  }
  return window.webContents;
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
  if (ElectronEvents.windowMap.has(windowName)) {
    ElectronEvents.windowMap.get(windowName).show();
    return;
  }
  const windowKey = windowName.replace(/-\w+$/, '');
  const viewport = await getWindowViewport(windowKey);
  const newWindow = new BrowserWindow(
    Object.assign(
      {
        parent: parent ? App.mainWindow : null,
        show: false,
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
      options || {},
      viewport
    )
  );

  newWindow.loadURL(url).then();
  ElectronEvents.windowMap.set(windowName, newWindow);
  newWindow.once('close', () => {
    ElectronEvents.windowMap.delete(windowName);
  });

  newWindow.on('resized', () => {
    const [width, height] = newWindow.getSize();
    saveWindowViewport(windowKey, { width, height });
  });

  return new Promise((resolve, reject) => {
    newWindow.once('ready-to-show', () => {
      newWindow.show();
      resolve(windowName);
    });
  });
});

/**
 * 获取窗口
 * @param name
 */


ipcMain.handle(ELECTRON_IPC_EVENT.TOGGLE_BROWSER_VIEW, async (event, args) => {
  const [parentName, windowName, url, height] = args;
  if (ElectronEvents.viewWindowMap.has(windowName)) {
    closeWindowView(parentName, windowName);
    return;
  }
  let win = getWindows(parentName);
  if (win) {
    const viewHeight = height || 300;
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        webSecurity: false,
        backgroundThrottling: false,
        preload: join(__dirname, 'main.preload.js'),
      },
    });
    win.setBrowserView(view);
    const rectangle = win.getBounds();
    const bounds = {
      y: rectangle.height - viewHeight,
      x: 0,
      width: rectangle.width,
      height: viewHeight,
    };
    view.setBounds(bounds);
    win.on('resize', () => {
      const rectangle = win.getBounds();
      view.setBounds({
        y: rectangle.height - viewHeight,
        x: 0,
        width: rectangle.width,
        height: viewHeight,
      });
    });

    ElectronEvents.viewWindowMap.set(windowName, view);

    win.webContents.send(ELECTRON_IPC_EVENT.ADD_WINDOW_VIEW_BOUNDS, bounds);

    await view.webContents.loadURL(url);
  }
});

ipcMain.handle(
  ELECTRON_IPC_EVENT.GET_WINDOW_VIEW_BOUNDS,
  async (event, args) => {
    const [windowName, index] = args;
    const windows = getWindows(windowName);
    if (windows) {
      const browserView = windows.getBrowserViews();
      if (browserView && browserView.length) {
        return browserView[index || 0].getBounds();
      }
    }
    return null;
  }
);

/**
 * 关掉window name窗口下的view
 * @param windowName
 * @param viewName
 */
function closeWindowView(windowName: string, viewName: string) {
  const windows = getWindows(windowName);
  if (windows) {
    App.logger.debug(`关闭[${windowName}]-view页面~`);
    const view = ElectronEvents.viewWindowMap.get(viewName);
    if (view) {
      windows.webContents.send(ELECTRON_IPC_EVENT.REMOVE_WINDOW_VIEW_BOUNDS);
      try {
        ElectronEvents.viewWindowMap.delete(viewName);
        windows.removeBrowserView(view);
        view.webContents.close();
      } catch (e) {
        App.logger.error(`关闭[${windowName}]-view页面发生错误~.${e}`);
      }
    }
  }
}

ipcMain.handle(ELECTRON_IPC_EVENT.CLOSE_WINDOW_VIEW, async (event, args) => {
  const [windowName, viewName] = args;
  closeWindowView(windowName, viewName);
});

ipcMain.on('closeWindow', async (event, args) => {
  const [windowName] = args;
  if (windowName) {
    const window = ElectronEvents.windowMap.get(windowName);
    window && window.close();
    ElectronEvents.windowMap.delete(windowName);
  }
});

ipcMain.handle('openExternal', async (event, args) => {
  const [url] = args;
  await shell.openExternal(url);
});

ipcMain.on('sendMessage', async (event, args) => {
  const [windowName, channel, data] = args;
  let window: BrowserWindow | BrowserView;
  if (windowName === MAIN_WINDOW_NAME) {
    window = App.mainWindow;
  } else {
    if (windowName.startsWith(BROWSER_VIEW_NAME_PREFIX)) {
      window = ElectronEvents.viewWindowMap.get(windowName);
    } else {
      window = ElectronEvents.windowMap.get(windowName);
    }
  }
  if (window) {
    window.webContents.send(channel, data);
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
  const webContents = getWebContents(name);
  if (webContents) {
    webContents.toggleDevTools();
  }
});

// Handle App termination
ipcMain.on('quit', (event, code) => {
  app.exit(code);
});
