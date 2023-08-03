import {
  IStep,
  RunContext,
  StepHandler,
  StepInterceptor,
  StepResult,
} from '@easy-wt/common';
import { Injectable, Logger } from '@nestjs/common';
import { defer, Observable, switchMap, tap } from 'rxjs';

/**
 * 日志记录的拦截器
 */
@Injectable()
export class LoggerStepInterceptor implements StepInterceptor {
  private logger = new Logger('用例运行');

  intercept(
    step: IStep,
    context: RunContext,
    handler: StepHandler
  ): Observable<StepResult<IStep>> {
    const name = context.scriptCase!.name;
    const typeName = (step.type != null ? step.type : '') || 'unknown';
    return defer(() => {
      this.logger.debug(`[${name}]准备执行[${step.name}][${typeName}]`);
      return Promise.resolve();
    }).pipe(
      switchMap(() => {
        const beginTime = new Date().getTime();
        return handler.handle(step, context).pipe(
          tap({
            next: () => {
              const endTime = new Date().getTime();
              this.logger.log(
                `[${name}]执行[${step.name}][${typeName}]完成,用时:${
                  endTime - beginTime
                }ms~`
              );
            },
            error: (err) => {
              const endTime = new Date().getTime();
              this.logger.warn(
                `[${name}]执行[${step.name}][${typeName}]失败,用时:${
                  endTime - beginTime
                }ms~`,
                err
              );
            },
          })
        );
      })
    );
  }
}
