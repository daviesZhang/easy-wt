import { IScriptCase } from './script-case';

export interface ISchedule {
  id: number;

  name: string;

  cron: string;

  serviceName: string;

  functionName: string;

  scriptCase: IScriptCase;

  params: Array<unknown>;

  enable: boolean;

  nextDate?: number;

  lastDate?: number;
}
