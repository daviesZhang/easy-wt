import { SupportDBType } from './common';

export const ENVIRONMENT_CONFIG_TOKEN = 'ENVIRONMENT_CONFIG_TOKEN';

/**
 * 环境变量
 */
export declare interface EnvironmentConfig {
  /**
   * chromium必填,目前导出pdf报告依赖chromium
   */
  chromium?: string;

  chromiumUserData?: string;

  /**
   * webkit内核浏览器,比如safari
   */
  webkit?: string;

  webkitUserData?: string;

  /**
   * 火狐浏览器
   */
  firefox?: string;

  /**
   * 用例运行的最大并发数
   */
  concurrent?: number;

  firefoxUserData?: string;

  /**
   * 输出目录
   */
  output: string;
  /**
   * 数据库配置
   */
  dbconfig: DbConfig;
}

export type DbConfig = {
  [Type in SupportDBType]: {
    type: Type;
    data: Type extends 'sqlite' ? string : DataSourceInfo;
  };
}[SupportDBType];

export interface DataSourceInfo {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}
