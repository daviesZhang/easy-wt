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
  ViewPlacement,
} from '@easy-wt/common';
import { fromEvent, takeWhile } from 'rxjs';
import Rectangle = Electron.Rectangle;

export default class ElectronEvents {
  static bootstrapElectronEvents(): Electron.IpcMain {
    return ipcMain;
  }
}

function getWindow(name: string) {
  if (!name || name === MAIN_WINDOW_NAME) {
    return App.mainWindow;
  } else {
    return App.windowMap.get(name);
  }
}

function getWebContents(windowName: string) {
  let window: BrowserWindow | BrowserView;
  if (windowName.startsWith(BROWSER_VIEW_NAME_PREFIX)) {
    window = App.viewWindowMap.get(windowName);
  } else {
    window = getWindow(windowName);
  }
  if (window) {
    return window.webContents;
  }
  return null;
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
 *
 * @param windowName 新的窗口名字
 * @param url 需要打开的URL
 * @param parent 是否作为主窗口的子窗口
 * @param options 其他选项
 */
async function createWindow(
  windowName: string,
  url: string | null,
  parent: boolean,
  options: { [key: string]: any }
) {
  if (App.windowMap.has(windowName)) {
    App.windowMap.get(windowName).show();
    return;
  }
  const windowKey = windowName.replace(/-\w+$/, '');
  const viewport = await getWindowViewport(windowKey);
  const newWindow = new BrowserWindow(
    Object.assign(
      {
        parent: parent ? App.mainWindow : null,
        show: true,
        frame: false,
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
  App.windowMap.set(windowName, newWindow);
  newWindow.once('close', () => {
    App.windowMap.delete(windowName);
  });
  newWindow.on('resized', () => {
    const [width, height] = newWindow.getSize();
    saveWindowViewport(windowKey, { width, height });
  });
  if (url) {
    await newWindow.loadURL(url);
    // await new Promise((resolve, reject) => {
    //   newWindow.once('ready-to-show', () => {
    //     // newWindow.show();
    //     resolve(windowName);
    //   });
    // });
  }
  return newWindow;
}

/**
 * 新开一个窗口
 * [windowName 文件名, url 文件url, parent:是否子窗口, ...other:其他配置参数]
 */
ipcMain.handle(ELECTRON_IPC_EVENT.CREATE_WINDOW, async (event, args) => {
  const [windowName, url, parent, options] = args;
  await createWindow(windowName, url, parent, options);
});


ipcMain.handle(
    ELECTRON_IPC_EVENT.SET_TOP_BROWSER_VIEW,
    async (event, args) => {
      const [windowName, viewName] = args;
      const window = getWindow(windowName);
      if (window) {
        const view = App.viewWindowMap.get(viewName);
        if (view) {
          window.getBrowserViews().forEach(item => {
            if (item === view) {
              window.setTopBrowserView(view);
            }
          })
        }
      }
    }
);

/**
 * 根据view的名字,找到它附加的window,并且show
 * @param viewName
 * 找到返回true,没找到返回false
 */
function findViewAndShow(viewName: string) {
  let view = App.viewWindowMap.get(viewName);
  if (view) {
    const window = BrowserWindow.fromBrowserView(view);
    if (window) {
      window.show();
      return true;
    }
    return false;
  }
}
/**
 * 开关独立VIEW
 */
ipcMain.handle(ELECTRON_IPC_EVENT.TOGGLE_BROWSER_VIEW, async (event, args) => {
  const [windowName, viewName, url, height] = args;
  const find = findViewAndShow(viewName);
  if (find) {
    return;
  }
  let win = getWindow(windowName);
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
    App.viewWindowMap.set(viewName, view);
    view.webContents.on('destroyed', () => {
      App.viewWindowMap.delete(viewName);
    });
    addBrowserView(win, view, (win: BrowserWindow, view: BrowserView) => {
      const rectangle = win.getBounds();
      const bounds = {
        y: rectangle.height - viewHeight,
        x: 0,
        width: rectangle.width,
        height: viewHeight,
      };
      view.setBounds(bounds);
      return bounds;
    });
    await view.webContents.loadURL(url);
  }
});

function addBrowserView(
  window: BrowserWindow,
  view: BrowserView,
  resize: (win: BrowserWindow, view: BrowserView) => Rectangle
) {
  window.addBrowserView(view);
  const bounds = resize(window, view);
  fromEvent(window, 'resize')
    .pipe(takeWhile(() => window.getBrowserViews().indexOf(view) >= 0))
    .subscribe((next) => resize(window, view));
  const rectangles = window.getBrowserViews().map((view) => view.getBounds());

  window.getBrowserViews().forEach((view) => {
    view.webContents.send(
      ELECTRON_IPC_EVENT.ADD_WINDOW_VIEW_BOUNDS,
      rectangles
    );
  });

}

/**
 * 分离VIEW,先把VIEW从现有的parentName窗口上删除,然后附加到windowName窗口上,不存在则创建
 */
ipcMain.handle(ELECTRON_IPC_EVENT.SEPARATE_VIEW, async (event, args) => {
  const [parentName, viewName, windowName, viewPlacement] = args;
  const window = getWindow(parentName);
  const view = App.viewWindowMap.get(viewName);
  window.removeBrowserView(view);
  const rectangles = window.getBrowserViews().map((view) => view.getBounds());
  window.getBrowserViews().forEach((view) => {
    view.webContents.send(
      ELECTRON_IPC_EVENT.REMOVE_WINDOW_VIEW_BOUNDS,
      rectangles
    );
  });
  let newWindow = getWindow(windowName);
  if (!newWindow) {
    newWindow = await createWindow(windowName, null, false, {
      show: true,
      frame: false,
    });
    newWindow.setMenu(null);
  }
  newWindow.hide();
  addBrowserView(newWindow, view, (win: BrowserWindow, view: BrowserView) => {
    const rectangle = win.getBounds();
    let bounds: Rectangle;
    if (viewPlacement) {
      const placement = viewPlacement as ViewPlacement;
      switch (placement.placement) {
        case 'bottom':
          bounds = {
            y: rectangle.height - (placement.height || 0),
            x: 0,
            width: placement.width || rectangle.width,
            height: placement.height || rectangle.height,
          };
          break;
        case 'right':
          bounds = {
            y: 0,
            x: rectangle.width - (placement.width || 0),
            width: placement.width || rectangle.width,
            height: placement.height || rectangle.height,
          };
          break;
        case 'top':
        case 'left':
        default:
          bounds = {
            y: 0,
            x: 0,
            width: placement.width || rectangle.width,
            height: placement.height || rectangle.height,
          };
          break;
      }
    } else {
      bounds = {
        y: 0,
        x: 0,
        width: rectangle.width,
        height: rectangle.height,
      };
    }
    view.setBounds(bounds);
    return bounds;
  });
  //当前electron版本一个神奇的bug,必须先hide,再show,不然再次附加到窗口不能渲染页面
  newWindow.show();
});

ipcMain.handle(
  ELECTRON_IPC_EVENT.GET_WINDOW_VIEW_BOUNDS,
  async (event, args) => {
    const [windowName, index] = args;
    const windows = getWindow(windowName);
    if (windows) {
      //BrowserWindow.fromBrowserView()
      const browserView = windows.getBrowserViews();
      if (browserView && browserView.length) {
        return browserView.map((view) => view.getBounds());
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
  const window = getWindow(windowName);
  if (window) {
    const view = App.viewWindowMap.get(viewName);
    if (view) {
      try {
        App.viewWindowMap.delete(viewName);
        window.removeBrowserView(view);
      } catch (e) {
        App.logger.error(`关闭[${windowName}]-view页面发生错误~.${e}`);
      }
      const rectangles = window
        .getBrowserViews()
        .map((view) => view.getBounds());
      window.getBrowserViews().forEach((view) => {
        view.webContents.send(
          ELECTRON_IPC_EVENT.REMOVE_WINDOW_VIEW_BOUNDS,
          rectangles
        );
      });
    }
  }
}

ipcMain.handle(ELECTRON_IPC_EVENT.CLOSE_WINDOW_VIEW, async (event, args) => {
  const [windowName, viewName] = args;
  closeWindowView(windowName, viewName);
});

ipcMain.on(ELECTRON_IPC_EVENT.CLOSE_WINDOW, async (event, args) => {
  const [windowName] = args;
  if (windowName) {
    const window = App.windowMap.get(windowName);
    window && window.close();
    App.windowMap.delete(windowName);
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
      window = App.viewWindowMap.get(windowName);
    } else {
      window = App.windowMap.get(windowName);
    }
  }
  if (window) {
    window.webContents.send(channel, data);
  }
});

ipcMain.on('reload', async (event, args) => {
  const [windowName] = args;
  if (windowName) {
    const window = App.windowMap.get(windowName);
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
    window = App.windowMap.get(windowName);
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
    window = App.windowMap.get(windowName);
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
    window = App.windowMap.get(windowName);
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
    window = App.windowMap.get(windowName);
  } else {
    window = App.mainWindow;
  }
  window && window.minimize();
});
ipcMain.on(ELECTRON_IPC_EVENT.TOGGLE_DEV_TOOLS, (event, name) => {
  const webContents = getWebContents(name);
  if (webContents) {
    webContents.toggleDevTools();
  }
});

// Handle App termination
ipcMain.on('quit', (event, code) => {
  app.exit(code);
});
