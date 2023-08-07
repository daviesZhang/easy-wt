import {StepResult} from './common';
import {IScriptCase, RunConfig} from './script-case';
import {IStep} from './step';

/**
 * 日志的事件名字
 */
export const LOG_EVENT_NAME = 'log';

/**
 * 日志事件推送的data
 */
export interface LoggerEventData {
  level: string;
  message: string;
  label?: string;
  timestamp: string;
}

/**
 * 用例中的事件列表
 */
export enum CaseEvent {
  CASE_BEGIN = 'CASE_BEGIN',

  CASE_END = 'CASE_END',

  STEP_BEGIN = 'STEP_BEGIN',

  STEP_END = 'STEP_END',

  CASE_ERROR = 'CASE_ERROR',

  /**
   * 用例被添加到执行队列
   */
  CASE_QUEUE_ADD = 'CASE_QUEUE_ADD',

  /**
   * 用例被移除执行队列
   */
  CASE_QUEUE_REMOVE = 'CASE_QUEUE_REMOVE',
}

/**
 * 用例步骤执行和结束的数据
 */
export interface CaseStepEvent {
  step: IStep;
  result?: StepResult<IStep>;
  caseRunCount: number;
  runCount: number;
}

export interface CaseBeginEvent {
  browserType: string;
  runConfig: RunConfig;
  scriptCase: IScriptCase;
}
