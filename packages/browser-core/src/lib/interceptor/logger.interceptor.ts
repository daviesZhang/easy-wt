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
  private logger = new Logger(LoggerStepInterceptor.name);

  intercept(
    step: IStep,
    context: RunContext,
    handler: StepHandler
  ): Observable<StepResult<IStep>> {
    const name = context.scriptCase!.name;
    const typeName = (step.type != null ? step.type : '') || 'unknown';
    return defer(() => {
      this.logger.debug(
        `[${step.caseId}-${step.id}]${name}准备执行[名称:${
          step.name
        }-动作:${typeName}${
          (step.expression || '') && `-表达式:${step.expression}`
        }]~`
      );
      return Promise.resolve();
    }).pipe(
      switchMap(() => {
        const beginTime = new Date().getTime();
        return handler.handle(step, context).pipe(
          tap({
            next: () => {
              const endTime = new Date().getTime();
              this.logger.log(
                `[${step.caseId}-${step.id}]${name}执行[名称:${
                  step.name
                }-动作:${typeName}]完成,用时:${endTime - beginTime}ms~`
              );
            },
            error: (err) => {
              const endTime = new Date().getTime();
              this.logger.warn(
                `[${step.caseId}-${step.id}]${name}执行[名称:${
                  step.name
                }-动作:${typeName}]失败,用时:${endTime - beginTime}ms~`,
                err
              );
            },
          })
        );
      })
    );
  }
}
