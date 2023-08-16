import {IStep} from './step';

import {SupportBrowserType} from './common';

/**
 * 用例接口
 */
export interface IScriptCase {
  id: number;

  /**
   * 是否文件夹
   */
  directory: boolean;

  name: string;

  children?: IScriptCase[];

  parent?: IScriptCase;

  parentId?: number;

  steps: IStep[];

  runConfig?: RunConfig;
}

/**
 * 运行时配置文件
 */
export interface RunConfig {
  id: number;

  caseId: number;

  browserType?: Array<SupportBrowserType>;

  runParams?: Record<string, unknown>;

  /**
   * 用例运行时唯一ID,同一个用例多个浏览器执行时,id一致
   */
  uuid?: string;
  /**
   * 用例的重试次数
   */
  retry?: number;

  /**
   * 步骤的重试次数
   */
  stepRetry?: number;

  /**
   * 步骤延迟 ms
   * 每次执行步骤之间添加延迟便于调试脚本
   */
  delay?: number;
}



export interface CaseQueue {
  uuid: string;
  scriptCase: IScriptCase;
}
