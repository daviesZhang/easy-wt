import {contextBridge, ipcRenderer} from 'electron';
import * as fs from 'fs-extra';
import {
  CaseEvent,
  EnvironmentConfig,
  ISchedule,
  QueryParams,
  Report,
  RunConfig,
  StatReport,
  Step,
} from '@easy-wt/common';
import * as path from 'path';

import {ReportService, ScriptCaseService, StepService,} from '@easy-wt/database-core';
import {ReportExportService} from '@easy-wt/browser-core';

import {v4 as uuidv4} from 'uuid';
import {environment} from '../../environments/environment';
import {CasePoolService, easyWTCore, ReportHelpService, ScheduleTaskService,} from '@easy-wt/easy-wt-core';
import {LoggerService} from '@nestjs/common/services/logger.service';
import {sendLogger} from './expose';
import {ExposeCaseService} from './case.preload';

/**
 * 获取环境配置文件路径
 */
async function getEnvFilePath(): Promise<string> {
  const userDataPath = await ipcRenderer.invoke('get-path', ['userData']);
  return path.join(userDataPath, 'environment.env');
}

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
  const casePoolService = module.get(CasePoolService);
  const scheduleTaskService = module.get(ScheduleTaskService);
  contextBridge.exposeInMainWorld('scheduleService', {
    scheduleExecuteCase: (params: {
      caseId: number;
      name: string;
      cron: string;
      enable?: boolean;
    }) => scheduleTaskService.scheduleExecuteCase(params),
    deleteSchedule: (scheduleId: number[]) =>
      scheduleTaskService.deleteSchedule(scheduleId),
    saveAndCreate: (schedules: Partial<ISchedule>[]) =>
      scheduleTaskService.saveAndCreate(schedules),
    findPage: (query: QueryParams) => scheduleTaskService.findPage(query),
    getCronNextDate: (corn: string) =>
      Promise.resolve(scheduleTaskService.getCronNextDate(corn)),
  });
  scheduleTaskService.init().then((next) => {
    sendLogger('info', '初始化定时任务完成~');
  });

  contextBridge.exposeInMainWorld('browserCore', {
    executeCase: (caseId: number, config: Partial<RunConfig>): Promise<void> =>
      casePoolService.executeCase(caseId, config),
    onEvent: (
      eventName: CaseEvent,
      listener: (...args: any[]) => void
    ): void => {
      casePoolService.eventEmitter.on(eventName, listener);
    },
    offEvent: (
      eventName: CaseEvent,
      listener: (...args: any[]) => void
    ): void => {
      casePoolService.eventEmitter.off(eventName, listener);
    },

    exportPDF: async (
      report: Report,
      savePath: string,
      lang = 'zh'
    ): Promise<string> => {
      const reportExportService = await module.resolve(ReportExportService);
      const mainURL = await getMainWindowLoadURL();
      const webPath: string = await ipcRenderer.invoke('get-loadReport-path');

      return await reportExportService.exportPDF(
        `file://${path.join(webPath, 'index.html#pdf')}?lang=${lang}`,
        report,
        environmentConfig.chromium,
        savePath
      );
    },
    exportHTML: async (
      report: Report,
      savePath: string,
      lang = 'zh'
    ): Promise<string> => {
      const webPath: string = await ipcRenderer.invoke('get-loadReport-path');
      const reportExportService = await module.resolve(ReportExportService);
      await reportExportService.reportZip(
        webPath,
        savePath,
        report,
        (action, dest) => {
          if (action.data.screenshot) {
            action.data.screenshot = dest;
          }
          if (action.data.video) {
            action.data.video = dest;
          }
        },
        lang
      );
      return savePath;
    },
  });

  const scriptCaseService = module.get(ScriptCaseService);
  const stepService = module.get(StepService);
  const reportService = module.get(ReportService);
  const reportHelpService = module.get(ReportHelpService);

  contextBridge.exposeInMainWorld(
    'scriptCaseService',
    new ExposeCaseService(scriptCaseService).expose()
  );
  contextBridge.exposeInMainWorld('stepService', {
    findAll: () => stepService.findAll(),
    findById: (id: number) => stepService.findById(id),
    save: (item: Array<Step>, sort?: boolean) => stepService.save(item, sort),
    update: (id: number, item: Step) => stepService.update(id, item),
    findByCaseId: (caseId: number) => stepService.findByCaseId(caseId),
    delete: (id: Array<number>) => stepService.delete(id),
  });
  contextBridge.exposeInMainWorld('reportService', {
    findPage: (query: QueryParams): Promise<[Report[], StatReport]> =>
      reportService.findPage(query),
    findById: (id: number) => reportService.findById(id),
    save: (item: Report[]) => reportService.save(item),
    delete: (id: Array<number>) => reportHelpService.deleteReport(id),
  });
}

const getMainWindowLoadURL = async (): Promise<string> =>
  await ipcRenderer.invoke('get-main-LoadURL');
try {
  contextBridge.exposeInMainWorld('electron', {
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    platform: process.platform,
    fs: () => fs,
    path: () => path,
    uuid: () => uuidv4(),
    isDevelopmentMode: async () => {
      const environment = await ipcRenderer.invoke('get-app-environment');
      return environment === 'development';
    },
    logger: (level: string, message: string, label?: string) =>
      sendLogger(level, message, label),
    getMainLoadURL: getMainWindowLoadURL,
    encryptedData: (data: string): Promise<string> =>
      ipcRenderer.invoke('encryptedData', [data]),
    decryptedData: (data: string): Promise<string> =>
      ipcRenderer.invoke('decryptedData', [data]),
    getPath: (name: string): Promise<string> =>
      ipcRenderer.invoke('get-path', [name]),
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
    onEvent: (event: string, callback) => ipcRenderer.on(event, callback),
    offEvent: (event: string, callback) => ipcRenderer.off(event, callback),
    sendMessage: (windowName: string, channel: string, ...args: any[]) => {
      ipcRenderer.send('sendMessage', [windowName, channel, args]);
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
