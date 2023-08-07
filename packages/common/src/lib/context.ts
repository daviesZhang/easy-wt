import { Observable } from 'rxjs';
import { StepResult, SupportBrowserType } from './common';
import { IStep } from './step';
import { IScriptCase, RunConfig } from './script-case';
import { EnvironmentConfig } from './environment-config';

export const ACTIONS_TOKEN = 'ACTIONS_TOKEN';
export interface IContext {
  interceptors: StepInterceptor[];

  /**
   * 运行时变量
   */
  runParams: Map<string, unknown>;

  /**
   * 上下文 唯一ID,每次创建出来的id是唯一的
   */
  uuid: string;

  /**
   * 当前的页面对象
   */
  page?: unknown;
  /**
   * 当前浏览器上下文
   */
  browser?: unknown;

  locator?: unknown;

  [key: string]: unknown;

  /**
   * 用例
   */
  scriptCase: IScriptCase;

  /**
   * 运行时配置
   */
  runConfig: RunConfig;

  /**
   * 浏览器类型
   */
  browserType: SupportBrowserType | null;

  /**
   * 环境变量
   */
  environmentConfig: EnvironmentConfig;

  /**
   * 用例name tree path
   */
  casePath: Array<string>;

  /**
   * 上一步的执行结果
   */
  previousResult?: StepResult<IStep>;
}

/**
 * 执行时的上下文,贯穿整个执行生命周期
 */
export class RunContext implements IContext {
  interceptors: StepInterceptor[];

  /**
   * 运行时变量
   */
  runParams: Map<string, unknown>;

  /**
   * 上下文 唯一ID,每次创建出来的id是唯一的
   */
  uuid: string;

  /**
   * 当前的页面对象
   */
  page?: unknown;
  /**
   * 当前浏览器上下文
   */
  browser?: unknown;

  locator?: unknown;

  [key: string]: unknown;

  /**
   * 用例
   */
  scriptCase: IScriptCase;

  /**
   * 运行时配置
   */
  runConfig: RunConfig;

  /**
   * 浏览器类型
   */
  browserType: SupportBrowserType | null;

  /**
   * 环境变量
   */
  environmentConfig: EnvironmentConfig;

  /**
   * 用例name tree path
   */
  casePath: Array<string>;

  /**
   * 上一步的执行结果
   */
  previousResult?: StepResult<IStep>;

  private stepRunCount = new Map<number, number>();

  private runCount = 1;

  /**
   * 标识 中断执行
   * @private
   */
  private _interrupted = false;

  constructor(params: IContext) {
    this.casePath = params.casePath;
    this.environmentConfig = params.environmentConfig;
    this.interceptors = params.interceptors;
    this.browserType = params.browserType;
    this.runConfig = params.runConfig;
    this.runParams = params.runParams;
    this.scriptCase = params.scriptCase;
    this.uuid = params.uuid;
    Object.assign(this, params);
  }

  addRunCount(count = 1): number {
    this.runCount += count;
    return this.runCount;
  }

  addStepCount(stepId: number, count = 1) {
    const current = this.getStepCount(stepId);
    const newValue = current + count;
    this.stepRunCount.set(stepId, newValue);
    return newValue;
  }

  getStepCount(stepId?: number): number {
    if (typeof stepId !== 'number') {
      return 0;
    }
    return this.stepRunCount.get(stepId) || 0;
  }

  getRunCount(): number {
    return this.runCount;
  }

  addInterceptors(interceptors: StepInterceptor[]) {
    this.interceptors = [...(this.interceptors || []), ...interceptors];
    return this.interceptors;
  }

  /**
   * 尝试打断用例
   */
  interrupt() {
    this._interrupted = true;
  }

  interrupted() {
    return this._interrupted;
  }
}

/**
 * 步骤执行的handler
 */
export declare abstract class StepHandler {
  abstract handle(
    step: IStep,
    context: RunContext
  ): Observable<StepResult<IStep>>;
}

/**
 * 步骤执行拦截器,每一个步骤,每一次执行都会进过拦截器
 */
export interface StepInterceptor {
  intercept(
    step: IStep,
    context: RunContext,
    handler: StepHandler
  ): Observable<StepResult<IStep>>;

  /**
   * 排序
   * 按照从小到大的顺序调用拦截器
   */
  order?: () => number;
}


/**
 * 步骤执行接口,所有步骤要求实现此接口
 */
export interface StepAction<R extends IStep> {
  run(step: R, context: RunContext): Promise<StepResult<R>>;

  support(step: IStep): boolean;
}
