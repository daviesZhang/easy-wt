import {IStep, RunContext, StepHandler, StepInterceptor, StepResult, StepResultError,} from '@easy-wt/common';
import {Logger} from '@nestjs/common';
import {catchError, from, Observable, of, retry, switchMap, throwError,} from 'rxjs';
import {errors, Page} from 'playwright';
import {ensurePath} from '../utils';

/**
 * 异常逻辑统一处理
 * 错误拦截器作为一种兜底拦截器,总是尽量放到最后执行
 */
export class ErrorInterceptor implements StepInterceptor {
  private logger = new Logger('用例运行');

  intercept(
    step: IStep,
    context: RunContext,
    handler: StepHandler
  ): Observable<StepResult<IStep>> {
    const retryCount =
      !context.interrupted() && context.runConfig && context.runConfig.stepRetry
        ? context.runConfig.stepRetry
        : 0;
    let next$ = handler.handle(step, context);
    if (retryCount > 0) {
      next$ = handler.handle(step, context).pipe(
        retry({
          delay: (err, count) => {
            if (retryCount >= count) {
              this.logger.log(
                `用例[${context.scriptCase.name}]步骤[${step.name}]准备开始第${count}次失败重试~`,
                '步骤重试'
              );
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
          message = 'step.error.selector_timeout';
        } else if (message && message.indexOf('strict mode violation') >= 0) {
          message = 'step.error.strict_mode_selector';
        }
        this.logger.error(
          `用例[${context.scriptCase.name}]步骤[${step.name}]运行失败,错误原因:[${message}]~`
        );
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
