import {
  app,
  BrowserWindow,
  Menu,
  nativeImage,
  screen,
  shell,
  Tray,
} from 'electron';
import { rendererAppName, rendererAppPort } from './constants';
import { environment } from '../environments/environment';
import { join } from 'path';
import { format } from 'url';
import * as winston from 'winston';

export default class App {
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  static mainWindow: Electron.BrowserWindow;
  static application: Electron.App;
  static BrowserWindow;

  static logger: winston.Logger;

  static loadURL: string;

  static isMac = process.platform === 'darwin';

  static loadWebPath = join(__dirname, '../', rendererAppName);

  static windowWidth: number;
  static windowHeight: number;
  static loadReportPath = this.isDevelopmentMode()
    ? join(__dirname, environment.reportFilePath)
    : join(__dirname, '../../', 'report');

  public static isDevelopmentMode() {
    const isEnvironmentSet: boolean = 'ELECTRON_IS_DEV' in process.env;
    const getFromEnvironment: boolean =
      parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;

    return isEnvironmentSet ? getFromEnvironment : !environment.production;
  }

  static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
    // we pass the Electron.App object and the
    // Electron.BrowserWindow into this function
    // so this class has no dependencies. This
    // makes the code easier to write tests for

    App.BrowserWindow = browserWindow;
    App.application = app;

    App.setMenu();
    App.application.on('window-all-closed', App.onWindowAllClosed); // Quit when all windows are closed.
    App.application.on('ready', App.onReady); // App is ready to load data
    App.application.on('activate', App.onActivate); // App is activated
  }

  private static onClose() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    App.mainWindow = null;
  }

  private static onRedirect(event: any, url: string) {
    if (url !== App.mainWindow.webContents.getURL()) {
      // this is a normal external redirect, open it in a new browser window
      event.preventDefault();
      shell.openExternal(url);
    }
  }

  private static onWindowAllClosed() {
    if (!this.isMac) {
      App.application.quit();
    }
  }

  private static onReady() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    App.initMainWindow();
    App.loadMainWindow();

    App.createTray();
  }

  private static onActivate() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (App.mainWindow === null) {
      App.onReady();
    }
  }

  private static setMenu() {
    if (this.isMac) {
      const template: Electron.MenuItemConstructorOptions[] = [
        {
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'quit' },
          ],
        },
        {
          label: '窗口',
          submenu: [
            { role: 'togglefullscreen' },
            { role: 'minimize' },
            { role: 'zoom' },
            { type: 'separator' },
            { role: 'close' },
          ],
        },
        {
          label: '编辑',
          submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
          ],
        },
      ];
      if (App.isDevelopmentMode()) {
        template.push({
          label: 'Debug',
          submenu: [{ role: 'toggleDevTools' }, { role: 'reload' }],
        });
      }
      const menu = Menu.buildFromTemplate(template);

      Menu.setApplicationMenu(menu);
    } else {
      Menu.setApplicationMenu(null);
    }
  }

  private static createTray() {
    let iconPath = 'icon/robot_64.png';
    if (App.application.isPackaged) {
      iconPath = join(__dirname, '../../', 'robot_64.png');
    }
    const icon = nativeImage.createFromPath(iconPath);

    const tray = new Tray(icon.resize({ height: 20, width: 20 }));
    tray.on('double-click', () => {
      App.mainWindow.show();
    });
  }

  private static loadMainWindow() {
    // load the index.html of the app.
    if (!App.application.isPackaged) {
      this.loadURL = `http://localhost:${rendererAppPort}`;
    } else {
      this.loadURL = format({
        pathname: join(App.loadWebPath, 'index.html'),
        protocol: 'file:',
        slashes: true,
      });
    }
    App.mainWindow.loadURL(this.loadURL);
  }

  private static initMainWindow() {
    const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
    const width = Math.min(1320, workAreaSize.width || 1320);
    const height = Math.min(720, workAreaSize.height || 720);
    this.windowWidth = width;
    this.windowHeight = height;
    // Create the browser window.
    App.mainWindow = new BrowserWindow({
      width: width,
      height: height,
      minWidth: 900,
      minHeight: 700,
      show: false,
      frame: false,
      autoHideMenuBar: true,
      webPreferences: {
        devTools: true,
        nodeIntegration: true,
        webSecurity: true,
        contextIsolation: true,
        backgroundThrottling: false,
        preload: join(__dirname, 'main.preload.js'),
      },
    });
    App.mainWindow.setMenu(null);

    App.mainWindow.center();

    // if main window is ready to show, close the splash window and show the main window
    App.mainWindow.once('ready-to-show', () => {
      App.mainWindow.show();
    });

    // handle all external redirects in a new browser window
    // App.mainWindow.webContents.on('will-navigate', App.onRedirect);
    // App.mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options) => {
    //     App.onRedirect(event, url);
    // });

    // Emitted when the window is closed.
    App.mainWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      App.mainWindow = null;
    });
  }
}
