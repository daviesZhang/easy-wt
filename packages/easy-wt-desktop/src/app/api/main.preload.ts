import { contextBridge, ipcRenderer } from 'electron';
import * as fs from 'fs-extra';
import {
  EnvironmentConfig,
  LOG_EVENT_NAME,
  LoggerEventData,
} from '@easy-wt/common';
import * as path from 'path';
import { join } from 'path';

import { environment } from '../../environments/environment';
import { easyWTCore } from '@easy-wt/easy-wt-core';
import { LoggerService } from '@nestjs/common/services/logger.service';
import {
  commonEventEmitter,
  getEnvFilePath,
  getMainWindowLoadURL,
  sendLogger,
} from './helper';
import { CaseExposeService } from './case.preload';
import { ScheduleExposeService } from './schedule.preload';
import { BrowserExposeService } from './browser.preload';
import { StepExposeService } from './step.preload';
import { ReportExposeService } from './report.preload';
import * as compressing from 'compressing';

class Logger implements LoggerService {
  debug(message: any, ...optionalParams: any[]): any {
    const [label] = optionalParams;
    sendLogger('debug', message, label);
  }

  error(message: any, ...optionalParams: any[]): any {
    const [label] = optionalParams;
    sendLogger('error', message, label);
  }

  log(message: any, ...optionalParams: any[]): any {
    const [label] = optionalParams;
    sendLogger('info', message, label);
  }

  warn(message: any, ...optionalParams: any[]): any {
    const [label] = optionalParams;
    sendLogger('warn', message, label);
  }
}

/**
 * 创建操作浏览器的相关服务
 * @param environmentConfig
 */
async function createCoreService(environmentConfig: EnvironmentConfig) {
  const module = await easyWTCore(
    environmentConfig,
    environment.production,
    new Logger()
  );
  sendLogger('info', '创建核心服务成功~');
  contextBridge.exposeInMainWorld(
    'scheduleService',
    new ScheduleExposeService(module).expose()
  );
  contextBridge.exposeInMainWorld(
    'browserCore',
    new BrowserExposeService(module, environmentConfig).expose()
  );
  contextBridge.exposeInMainWorld(
    'scriptCaseService',
    new CaseExposeService(module).expose()
  );
  contextBridge.exposeInMainWorld(
    'stepService',
    new StepExposeService(module).expose()
  );
  contextBridge.exposeInMainWorld(
    'reportService',
    new ReportExposeService(module).expose()
  );
}


try {
  contextBridge.exposeInMainWorld('electron', {
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    platform: process.platform,
    fs: () => fs,
    path: () => path,
    isDevelopmentMode: async () => {
      const environment = await ipcRenderer.invoke('get-app-environment');
      return environment === 'development';
    },
    /**
     * 持久化记录日志
     * @param level
     * @param message
     * @param label
     */
    logger: (level: string, message: string, label?: string) =>
      sendLogger(level, message, label),
    getMainLoadURL: getMainWindowLoadURL,
    encryptedData: (data: string): Promise<string> =>
      ipcRenderer.invoke('encryptedData', [data]),
    decryptedData: (data: string): Promise<string> =>
      ipcRenderer.invoke('decryptedData', [data]),
    getPath: (name: string): Promise<string> =>
      ipcRenderer.invoke('get-path', [name]),
    /**
     * 打开控制台
     * @param name
     */
    toggleDevTools: (name?: string) =>
      ipcRenderer.send('toggleDevTools', [name]),
    newWindow: (
      windowName: string,
      url: string,
      parent = false,
      option?: {
        [key: string]: unknown;
      }
    ): Promise<string> => {
      return ipcRenderer.invoke('newWindow', [windowName, url, parent, option]);
    },

    closeApp: () => {
      ipcRenderer.send('quit');
    },
    reload: (name?: string) => {
      ipcRenderer.send('reload', [name]);
    },
    closeWindow: (name: string) => {
      ipcRenderer.send('closeWindow', [name]);
    },
    maximizeWindow: (name?: string) => {
      ipcRenderer.send('maximizeWindow', [name]);
    },
    minimizeWindow: (name?: string) => {
      ipcRenderer.send('minimizeWindow', [name]);
    },
    /**
     * 当有日志记录的时候发出
     * @param callback
     */
    onLogEvent: (callback: (message: LoggerEventData) => void) =>
      commonEventEmitter.on(LOG_EVENT_NAME, callback),
    /**
     * 注册主进程发出的页面消息事件
     * @param event
     * @param callback
     */
    onMainEvent: (event: string, callback) => ipcRenderer.on(event, callback),
    offMainEvent: (event: string, callback) => ipcRenderer.off(event, callback),
    /**
     * 给其他页面发送消息事件
     * @param windowName
     * @param channel
     * @param args
     */
    sendMessage: (windowName: string, channel: string, ...args: any[]) => {
      ipcRenderer.send('sendMessage', [windowName, channel, args]);
    },
    /**
     * 给主进程发送事件
     * @param channel
     * @param args
     */
    invokeEvent: (channel: string, ...args: any[]) => {
      return ipcRenderer.invoke(channel, args);
    },
    showSaveDialog: async (
      options: { [key: string]: any },
      windowName?: string
    ): Promise<string> => {
      const defaultPath = await ipcRenderer.invoke('get-path', ['desktop']);
      return ipcRenderer.invoke('showSaveDialog', [
        Object.assign({}, options, { defaultPath }),
        windowName,
      ]);
    },
    showOpenDialog: async (
      options: { [key: string]: any },
      windowName?: string
    ): Promise<string[]> => {
      const defaultPath = await ipcRenderer.invoke('get-path', ['desktop']);
      return ipcRenderer.invoke('showOpenDialog', [
        Object.assign({}, options, { defaultPath }),
        windowName,
      ]);
    },
    /**
     * 获取环境变量
     */
    getEnvironmentConfig: async (): Promise<EnvironmentConfig | null> => {
      const filePath = await getEnvFilePath();
      const exist = await fs.pathExists(filePath);
      if (exist) {
        try {
          const config = (await fs.readJSON(filePath)) as EnvironmentConfig;
          return Promise.resolve(config);
        } catch (err) {
          sendLogger('error', '读取环境变量时出现错误~');
          return Promise.reject(err);
        }
      }

      return Promise.resolve(null);
    },

    /**
     * 保存环境变量
     */
    saveEnvironmentConfig: async (
      config: Partial<EnvironmentConfig>
    ): Promise<EnvironmentConfig> => {
      const filePath = await getEnvFilePath();
      const userData = await ipcRenderer.invoke('get-path', ['userData']);
      const defaultConfig = {
        output: path.join(userData, 'output'),
        dbconfig: {
          type: 'sqlite',
          data: path.join(userData, 'db.sql'),
        },
      };
      const margeConfig = Object.assign(defaultConfig, config);
      await fs.writeJSON(filePath, Object.assign(defaultConfig, config), {
        spaces: 2,
      });
      return Promise.resolve(margeConfig);
    },

    /**
     * 启动相关service
     * @param config
     */
    startService: async (config: EnvironmentConfig): Promise<void> => {
      try {
        if (
          typeof config.dbconfig.data !== 'string' &&
          config.dbconfig.data.password
        ) {
          const password = config.dbconfig.data.password;
          config.dbconfig.data.password = await ipcRenderer.invoke(
            'decryptedData',
            [password]
          );
        }
        await ffmpegUncompress();
        await createCoreService(config);
      } catch (err) {
        sendLogger('error', `启动core服务失败~message:[${err.message}]`);
        return Promise.reject({
          err: err,
          message: '创建核心服务时出现异常,请检查配置~',
        });
      }
    },
  });
} catch (err) {
  console.error(err);
}

async function ffmpegUncompress() {
  const ffmpeg = join(__dirname, 'ffmpeg-win64.zip');
  if (await fs.pathExists(ffmpeg)) {
    const ffmpegPath = path.join('Local', 'ms-playwright', 'ffmpeg-1009');
    const appData = await ipcRenderer.invoke('get-path', ['appData']);
    const dest = path.join(appData, ffmpegPath);
    if (await fs.pathExists(join(dest, 'ffmpeg-win64.exe'))) {
      return;
    }
    await compressing.zip.uncompress(ffmpeg, dest);
  }
}
