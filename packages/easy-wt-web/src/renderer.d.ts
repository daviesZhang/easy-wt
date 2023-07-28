import {
  CaseEvent,
  EnvironmentConfig,
  ISchedule,
  IScriptCase,
  IStep,
  QueryParams,
  Report,
  RunConfig,
  StatReport,
} from '@easy-wt/common';
import { ScriptCaseService } from '@easy-wt/database';

export interface IElectronAPI {
  getAppVersion: () => string;
  fs: () => fs;
  path: () => path;
  uuid: () => string;
  getPath: (name: string) => Promise<string>;
  isDevelopmentMode: () => Promise<boolean>;
  maximizeWindow: (name: string) => void;
  minimizeWindow: (name: string) => void;
  newWindow: (
    windowName: string,
    url: string,
    parent = false,
    other?: { [key: string]: any }
  ) => Promise<string>;
  encryptedData: (data: string) => Promise<string>;
  decryptedData: (data: string) => Promise<string>;
  closeWindow: (name: string) => void;
  closeApp: () => void;
  reload: () => void;
  toggleDevTools: (name?: string) => void;
  getMainLoadURL: () => Promise<string>;
  showSaveDialog: (
    options: { [key: string]: unknown },
    windowName?: string
  ) => Promise<string>;
  showOpenDialog: (
    options: { [key: string]: unknown },
    windowName?: string
  ) => Promise<string[]>;
  getEnvironmentConfig: () => Promise<EnvironmentConfig | null>;
  saveEnvironmentConfig: (
    config: Partial<EnvironmentConfig>
  ) => Promise<EnvironmentConfig>;
  startService: (config: EnvironmentConfig) => Promise<void>;

  onEvent: (event: string, callback) => void;
  offEvent: (event: string, callback) => void;
  sendMessage: (windowName: string, channel: string, ...args: any[]) => void;
  logger: (level: string, message: string, label?: string) => void;
}

export interface BrowserCore {
  executeCase: (caseId: number[], config: Partial<RunConfig>) => Promise<void>;

  onEvent: (
    eventName: CaseEvent,
    listener: (...args: unknown[]) => void
  ) => void;
  offEvent: (
    eventName: CaseEvent,
    listener: (...args: unknown[]) => void
  ) => void;
  exportPDF: (
    report: Report,
    savePath: string,
    lang: string
  ) => Promise<string>;
  exportHTML: (
    report: Report,
    savePath: string,
    lang = 'zh'
  ) => Promise<string>;
  deviceDescriptors: () => Array<string>;
}

export interface ScheduleService {
  scheduleExecuteCase: (params: {
    caseId: number;
    name: string;
    cron: string;
    enable?: boolean;
  }) => Promise<void>;
  saveAndCreate: (schedules: Partial<ISchedule>[]) => Promise<void>;
  deleteSchedule: (scheduleId: number[]) => Promise<void>;
  findPage: (query: QueryParams) => Promise<[ISchedule[], number]>;
  getCronNextDate: (cron: string) => Promise<number | null>;
}

export interface ScriptCaseService {
  findAll: () => Promise<IScriptCase[]>;
  findById: () => Promise<IScriptCase>;
  save: (item: Partial<IScriptCase>) => Promise<IScriptCase>;
  update: (id: number) => Promise<string>;
  findCasesById: (id: number) => Promise<IScriptCase[]>;
  findDescendantsById: (categoryId: number) => Promise<IScriptCase[]>;
  findTrees: () => Promise<IScriptCase[]>;
  copyCase: (id: number) => Promise<IScriptCase[]>;
  findRoots: () => Promise<IScriptCase[]>;
  findAncestorsTree: (id: number) => Promise<IScriptCase>;
  delete: (id: number) => Promise<number[]>;
  exportCase: (
    id: number,
    savePath: string,
    parentTree: boolean
  ) => Promise<void>;
  importCase: (id: number | null, filePath: string) => Promise<IScriptCase>;
}

export interface StepService {
  findAll: () => Promise<IStep[]>;
  findById: () => Promise<IStep>;
  save: (item: Array<IStep>, sort?: boolean) => Promise<IStep[]>;
  update: (id: number, step: Partial<IStep>) => Promise<string>;
  findByCaseId: (caseId: number) => Promise<IStep[]>;
  delete: (id: Array<number>) => Promise<string>;
}

export interface ReportService {
  findPage: (query: QueryParams) => Promise<[Report[], StatReport]>;
  findById: (id: number) => Promise<Report>;
  save: (item: Report[]) => Promise<Report[]>;
  delete: (id: Array<number>) => Promise<void>;
}

declare global {
  interface Window {
    electron: IElectronAPI;
    browserCore: BrowserCore;
    scheduleService: ScheduleService;
    stepService: StepService;
    scriptCaseService: ScriptCaseService;
    reportService: ReportService;
    reportData: Report;
    notice: { serviceComplete: boolean };
  }
}
