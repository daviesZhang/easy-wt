import {
  ACTIONS_TOKEN,
  ENVIRONMENT_CONFIG_TOKEN,
  EnvironmentConfig,
  IStep,
  Report,
  RunContext,
  StepAction,
  StepInterceptor,
  StepResult,
  StepType,
} from '@easy-wt/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { BrowserContext } from 'playwright';
import {
  catchError,
  concat,
  exhaustMap,
  finalize,
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

import {
  LoggerStepBeginInterceptor,
  LoggerStepEndInterceptor,
} from './interceptor/logger.interceptor';
import { ReportInterceptor } from './interceptor/report.interceptor';
import { getWriteStreamMap } from './utils';
import { ErrorInterceptor } from './interceptor/error.interceptor';
import { InterceptingHandler } from './interceptor/intercepting.handler';
import { BackendStepHandler } from './interceptor/backend-step.handler';
import { InterruptInterceptor } from './interceptor/interrupt.interceptor';

const errorInterceptor = new ErrorInterceptor();
const interruptInterceptor = new InterruptInterceptor();

@Injectable()
export class CaseRunService {
  private logger = new Logger(CaseRunService.name);

  constructor(
    private loggerStepBeginInterceptor: LoggerStepBeginInterceptor,
    private loggerStepEndInterceptor: LoggerStepEndInterceptor,
    @Inject(ACTIONS_TOKEN) private actions: Array<StepAction<IStep>>,
    @Inject(ENVIRONMENT_CONFIG_TOKEN)
    private environmentConfig: EnvironmentConfig
  ) {}

  /**
   * 运行用例
   */
  run(context: RunContext): Observable<StepResult<IStep>> {
    const actions = this.prepareActions(context);
    return this.executeActions(actions, context);
  }

  /**
   * 运行用例并生成报告
   * 通过添加报告拦截器的方式收集用例结果,然后生成报告
   * @see Report
   * @param context
   */
  runAndReport(context: RunContext): Observable<Report> {
    const reportInterceptor = new ReportInterceptor(context.scriptCase);
    context.interceptors.push(reportInterceptor);
    return this.run(context).pipe(
      tap({
        next: (next) => reportInterceptor.next(next, context),
        error: (err) => reportInterceptor.error(err, context),
      }),
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

  /**
   * 用例执行完成的收尾工作
   * 关闭浏览器
   * 关闭任何存在的写入流
   * @param context
   */
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
            context.interrupted() ||
            !context.runConfig ||
            typeof context.runConfig.retry !== 'number' ||
            count > context.runConfig.retry
          ) {
            return throwError(() => error);
          }
          this.logger.debug(
            `准备开始第${count}次重试用例[${context.scriptCase.name}]~`,
            '用例重试'
          );
          return this.closeBrowser(context).then(() => context.addRunCount());
        },
      }),
      finalize(() => this.finalize(context).then())
    );
  }

  /**
   * 织如入执行拦截器,内置的特定拦截器总是按照指定顺序执行
   * 其他拦截器根据order 升序执行
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
          this.loggerStepEndInterceptor,
          errorInterceptor,
          context.interceptors.sort(
            (a, b) => (a.order ? a.order() : 0) - (b.order ? b.order() : 0)
          ),
          interruptInterceptor,
          this.loggerStepBeginInterceptor
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
            if (data.data && data.data['next'] === false) {
              //当while返回false,意味着循环需要结束
              action$ = [of(data)];
            }
            return concat(...action$);
          })
        );
      }),
      takeWhile(
        (next) =>
          next.step.type !== StepType.STRUCT_WHILE ||
          !next.data ||
          next.data['next'] !== false,
        true
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
   * 根据用例步骤匹配对应的执行类
   * @param step
   * @private
   */
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
