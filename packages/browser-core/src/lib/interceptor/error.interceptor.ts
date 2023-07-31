import {IStep, RunContext, StepHandler, StepInterceptor, StepResult, StepResultError,} from '@easy-wt/common';
import {Logger} from '@nestjs/common';
import {catchError, from, Observable, of, retry, switchMap, throwError,} from 'rxjs';
import {errors, Page} from 'playwright';
import {ensurePath} from '../utils';

/**
 * 异常逻辑统一处理
 */
export class ErrorInterceptor implements StepInterceptor {
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
