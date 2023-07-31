import {
  ACTIONS_TOKEN,
  ENVIRONMENT_CONFIG_TOKEN,
  EnvironmentConfig,
  IStep,
  Report,
  RunContext,
  StepAction,
  StepHandler,
  StepInterceptor,
  StepResult,
  StepResultError,
  StepType,
  StructEndwhile,
} from '@easy-wt/common';
import {Inject, Injectable, Logger} from '@nestjs/common';
import {BrowserContext, errors, Page} from 'playwright';
import {
  catchError,
  concat,
  defer,
  exhaustMap,
  finalize,
  from,
  interval,
  last,
  map,
  Observable,
  of,
  retry,
  switchMap,
  takeWhile,
  tap,
  throwError,
} from 'rxjs';

import {LoggerStepInterceptor} from './interceptor/logger.interceptor';
import {ReportInterceptor} from './interceptor/report.interceptor';
import {ensurePath, getWriteStreamMap} from './utils';

/**
 * StepInterceptor 转 handler
 */
class InterceptorHandler implements StepHandler {
  next: StepHandler;
  interceptor: StepInterceptor;

  constructor(next: StepHandler, interceptor: StepInterceptor) {
    this.next = next;
    this.interceptor = interceptor;
  }

  handle(step: IStep, context: RunContext) {
    return this.interceptor.intercept(step, context, this.next);
  }
}

/**
 * handler执行
 */
class InterceptingHandler implements StepHandler {
  interceptors: StepInterceptor[];

  backend: StepHandler;

  constructor(backend: StepHandler, interceptors: StepInterceptor[]) {
    this.backend = backend;
    this.interceptors = interceptors;
  }

  handle(step: IStep, context: RunContext): Observable<StepResult<IStep>> {
    const chain = this.interceptors.reduceRight(
      (next, interceptor) => new InterceptorHandler(next, interceptor),
      this.backend
    );
    return chain.handle(step, context);
  }
}

/**
 *
 * 最后兜底实际执行对应逻辑的拦截器
 */
class BackendStepHandler implements StepHandler {
  action: StepAction<IStep>;

  // 提取变量
  regx = new RegExp('(?<!\\$)(\\$\\{(\\w+)})', 'g');

  constructor(action: StepAction<IStep>) {
    this.action = action;
  }

  /**
   * 替换占位符作为变量
   * @param value
   * @param params
   */
  private paramsReplace(value: string, params: Map<string, unknown>): string {
    let rest = this.regx.exec(value);
    let newString = value;
    while (rest != null) {
      const [str, , key] = rest;
      const newValue = params.get(key);
      if (typeof newValue === 'number') {
        newString = newString.replace(str, newValue.toString());
      } else if (typeof newValue === 'string') {
        newString = newString.replace(str, newValue);
      } else {
        newString = newString.replace(str, '');
      }
      rest = this.regx.exec(value);
    }
    return newString;
  }

  /**
   * 步骤执行
   * 首先把全部参数,配置里面的占位符${}变量找出来替换成实际的值,然后执行对应步骤的run方法
   * @param step
   * @param context
   */
  handle(step: IStep, context: RunContext): Observable<StepResult<IStep>> {
    return defer(() => {
      /**
       * 简单拷贝一份step
       */
      const copyStep = JSON.parse(JSON.stringify(step));
      const keys = Object.keys(step) as Array<keyof IStep>;
      keys.forEach((key) => {
        const value = step[key];
        if (typeof value === 'string') {
          copyStep[key] = this.paramsReplace(value, context.runParams);
        }
      });
      const options = copyStep.options;
      if (options) {
        Object.keys(options).forEach((key) => {
          const value = options[key];
          if (typeof value === 'string') {
            options[key] = this.paramsReplace(value, context.runParams);
          }
        });
      }
      const selector = copyStep.selector;
      if (selector) {
        Object.keys(selector).forEach((key) => {
          const value = selector[key];
          if (typeof value === 'string') {
            selector[key] = this.paramsReplace(value, context.runParams);
          }
        });
      }
      context.addStepCount(step.id!);
      return defer(() => this.action.run(copyStep, context));
    });
  }
}

/**
 * 异常逻辑统一处理
 */
class ErrorInterceptor implements StepInterceptor {
  private logger = new Logger('ErrorInterceptor');

  intercept(
    step: IStep,
    context: RunContext,
    handler: StepHandler
  ): Observable<StepResult<IStep>> {
    const retryCount =
      context.runConfig && context.runConfig.stepRetry
        ? context.runConfig.stepRetry
        : 0;
    let next$ = handler.handle(step, context);
    if (retryCount > 0) {
      next$ = handler.handle(step, context).pipe(
        retry({
          delay: (err, count) => {
            if (retryCount >= count) {
              this.logger.log(`准备开始第${count}次重试步骤${step.name}~`);
              return of(true);
            }
            return throwError(() => err);
          },
        })
      );
    }
    return next$.pipe(
      catchError((err) => {
        let message = err.message || err;
        if (err instanceof errors.TimeoutError) {
          message = '查找元素或者操作等待超时~';
        }

        const page = context.page as Page;
        if (page && !page.isClosed() && context.environmentConfig.output) {
          const runId = context.uuid;
          return from(
            ensurePath(context, ['images', `${runId}_error_${step.id}.png`])
          ).pipe(
            switchMap((imagePath) =>
              page
                .screenshot({ path: imagePath, fullPage: true })
                .then(() => imagePath)
            ),
            switchMap((imagePath) => {
              return throwError(
                () =>
                  new StepResultError({
                    name: step.name,
                    message: message,
                    step: step,
                    success: false,
                    next: false,
                    data: { screenshot: imagePath, message },
                  })
              );
            })
          );
        }
        return throwError(
          () =>
            new StepResultError({
              name: step.name,
              step: step,
              message: message,
              success: false,
              next: false,
              data: { message: message },
            })
        );
      })
    );
  }
}

const errorInterceptor = new ErrorInterceptor();

@Injectable()
export class CaseRunService {
  private logger = new Logger(CaseRunService.name);

  constructor(
    private loggerStepInterceptor: LoggerStepInterceptor,
    @Inject(ACTIONS_TOKEN) private actions: Array<StepAction<IStep>>,
    @Inject(ENVIRONMENT_CONFIG_TOKEN)
    private environmentConfig: EnvironmentConfig
  ) {}

  /**
   * 运行用例
   * 1.把传入的运行时配置和用例中的运行时配置组合,优先级:传入>用例
   * 2.组装用例执行,处理好IF和WHILE
   * 3.执行
   */
  run(context: RunContext): Observable<StepResult<IStep>> {
    const actions = this.prepareActions(context);
    return this.executeActions(actions, context);
  }

  /**
   * 运行用例并生成报告
   * 通过添加报告拦截器的方式收集用例结果,然后生成报告
   * @param context
   */
  runAndReport(context: RunContext): Observable<Report> {
    const reportInterceptor = new ReportInterceptor(context.scriptCase);
    context.interceptors.push(reportInterceptor);
    return this.run(context).pipe(
      last(),
      map(() => reportInterceptor.reportGenerate()),
      catchError(() => {
        return of(reportInterceptor.reportGenerate());
      })
    );
  }

  /**
   * 遍历步骤列表,组织步骤执行的Observable
   * 主要需要处理两个特殊结构步骤,IF和WHILE,当遇到IF时需要根据结果判断分支决定执行顺序
   * 当遇到WHILE时需要根据结果判断是否重复执行 特定步骤列表
   * 生成实际需要执行的步骤列表,按顺序执行
   * @param context
   */
  private prepareActions(context: RunContext) {
    const steps: IStep[] = context.scriptCase.steps;
    const actions$: Observable<StepResult<IStep>>[] = [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.type === StepType.STRUCT_IF) {
        const result = this.ifStep(i, steps, context);
        i = result.index;
        actions$.push(result.next);
      } else if (step.type === StepType.STRUCT_WHILE) {
        const result = this.whileStep(i, steps, context);
        i = result.index;
        actions$.push(result.next);
      } else {
        actions$.push(this.runAction(context, step));
      }
    }
    return actions$;
  }

  async finalize(context: RunContext) {
    await this.closeBrowser(context);
    const map = getWriteStreamMap(context);
    if (map) {
      for (const value of map.values()) {
        value.end();
      }
    }
  }

  private executeActions(
    actions$: Observable<StepResult<IStep>>[],
    context: RunContext
  ): Observable<StepResult<IStep>> {
    return concat(...actions$).pipe(
      tap((next: StepResult<IStep>) => {
        context.previousResult = next;
      }),
      takeWhile((value: StepResult<IStep>) => !!value.next, true),
      retry({
        delay: (error, count) => {
          if (
            !context.runConfig ||
            typeof context.runConfig.retry !== 'number' ||
            count > context.runConfig.retry
          ) {
            return throwError(() => error);
          }
          this.logger.log(
            `准备开始第${count}次重试用例[${context.scriptCase.name}]~`
          );
          return this.closeBrowser(context).then(() => context.addRunCount());
        },
      }),
      finalize(() => this.finalize(context).then())
    );
  }

  private async closeBrowser(context: RunContext) {
    const browserContext = context.browser as BrowserContext;
    if (browserContext) {
      try {
        const browser = browserContext.browser();
        await browserContext.close();
        browser && browser.isConnected() && (await browser.close());
      } catch (err) {
        this.logger.error('执行结束后自动关闭浏览器时出现异常~', err);
      }
    }
  }

  /**
   * 织如入执行拦截器
   * @param context
   * @param steps
   * @private
   */
  private runAction(
    context: RunContext,
    ...steps: IStep[]
  ): Observable<StepResult<IStep>> {
    const actions$: Observable<StepResult<IStep>>[] = [];
    for (const step of steps) {
      const action = this.matchAction(step);
      const result$ = new InterceptingHandler(
        new BackendStepHandler(action),
        ([] as StepInterceptor[]).concat(
          context.interceptors,
          errorInterceptor,
          this.loggerStepInterceptor
        )
      ).handle(step, context);
      actions$.push(result$);
    }
    return concat(...actions$);
  }

  /**
   * IF 结构的处理逻辑
   * @param index
   * @param steps
   * @param context
   * @private
   */
  private ifStep(
    index: number,
    steps: IStep[],
    context: RunContext
  ): {
    next: Observable<StepResult<IStep>>;
    index: number;
  } {
    const success: Observable<StepResult<IStep>>[] = [];
    const fail: Observable<StepResult<IStep>>[] = [];
    let next = false;
    const ifAction = this.runAction(context, steps[index]);
    index++;
    for (; index < steps.length; index++) {
      const step = steps[index];
      if (step.type === StepType.STRUCT_ELSE) {
        next = true;
        continue;
      }
      const action = this.getAction(step, index, steps, context);
      index = action.index;

      next ? fail.push(action.action$) : success.push(action.action$);
      if (step.type === StepType.STRUCT_ENDIF) {
        break;
      }
    }
    const next$ = ifAction.pipe(
      switchMap((result) => {
        if (result.data && result.data['success']) {
          return concat(of(result), ...success);
        } else {
          return concat(of(result), ...fail);
        }
      })
    );
    return { next: next$, index };
  }

  /**
   * WHILE 结构的处理逻辑
   * @param index
   * @param steps
   * @param context
   * @private
   */
  private whileStep(
    index: number,
    steps: IStep[],
    context: RunContext
  ): {
    next: Observable<StepResult<IStep>>;
    index: number;
  } {
    const actions: Observable<StepResult<IStep>>[] = [];
    const while$ = this.runAction(context, steps[index]);
    index++;
    for (; index < steps.length; index++) {
      const step = steps[index];
      const action = this.getAction(step, index, steps, context);
      index = action.index;
      actions.push(action.action$);
      if (step.type === StepType.STRUCT_ENDWHILE) {
        break;
      }
    }
    const next = interval(100).pipe(
      exhaustMap(() => {
        return while$.pipe(
          switchMap((data) => {
            let action$ = [of(data), ...actions];
            if (!data!.data!['next']) {
              const endStep = new StructEndwhile('endwhile');
              //当while返回false,意味着循环需要结束,添加一个结束的Observable
              const endAction: StepResult<IStep> = {
                next: true,
                success: true,
                step: endStep,
              };
              action$ = [of(endAction)];
            }
            return concat(...action$);
          })
        );
      }),
      takeWhile(
        (next) => next.step !== null && typeof next.step.id === 'number'
      )
    );
    return { next, index };
  }

  /**
   * 对于嵌套IF,WHILE 动作,特殊处理,获取嵌套部分的动作
   * @param step
   * @param index
   * @param steps
   * @param context
   * @private
   */
  private getAction(
    step: IStep,
    index: number,
    steps: IStep[],
    context: RunContext
  ) {
    let action$: Observable<StepResult<IStep>>;
    if (step.type === StepType.STRUCT_IF) {
      const result = this.ifStep(index, steps, context);
      index = result.index;
      action$ = result.next;
    } else if (step.type === StepType.STRUCT_WHILE) {
      const result = this.whileStep(index, steps, context);
      index = result.index;
      action$ = result.next;
    } else {
      action$ = this.runAction(context, step);
    }
    return { action$, index };
  }

  private matchAction<T extends IStep>(step: T): StepAction<T> {
    try {
      return this.actions.find((action) =>
        action.support(step)
      ) as StepAction<T>;
    } catch (error) {
      this.logger.error('查找处理步骤的action时发生异常~', error);
      throw error;
    }
  }
}
