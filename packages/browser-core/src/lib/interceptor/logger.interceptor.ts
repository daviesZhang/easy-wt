import {IStep, RunContext, StepHandler, StepInterceptor, StepResult,} from '@easy-wt/common';
import {Injectable, Logger} from '@nestjs/common';
import {defer, Observable, tap} from 'rxjs';

/**
 * 日志记录的拦截器
 */
@Injectable()
export class LoggerStepBeginInterceptor implements StepInterceptor {
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
      return handler.handle(step, context);
    });
  }
}

@Injectable()
export class LoggerStepEndInterceptor implements StepInterceptor {
  private logger = new Logger('用例运行');

  intercept(
    step: IStep,
    context: RunContext,
    handler: StepHandler
  ): Observable<StepResult<IStep>> {
    const name = context.scriptCase!.name;
    const typeName = (step.type != null ? step.type : '') || 'unknown';
    return handler.handle(step, context).pipe(
      tap({
        next: () => {
          this.logger.log(`[${name}]执行[${step.name}][${typeName}]完成`);
        },
        error: (err) => {
          this.logger.warn(
            `[${name}]执行[${step.name}][${typeName}]失败,信息:${JSON.stringify(
              err
            )}`
          );
        },
      })
    );
  }
}
