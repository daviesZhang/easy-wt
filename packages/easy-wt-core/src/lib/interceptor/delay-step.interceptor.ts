import {IStep, RunContext, StepHandler, StepInterceptor, StepResult,} from '@easy-wt/common';
import {delay, Observable, of, switchMap, tap,} from 'rxjs';
import {Logger} from '@nestjs/common';


/**
 * 支持延迟执行功能的拦截器
 */
export class DelayStepInterceptor implements StepInterceptor {
  delay: number;

  private log = new Logger('延迟拦截器');
  constructor(delay: number) {
    this.delay = delay;
  }

  intercept(
    step: IStep,
    context: RunContext,
    handler: StepHandler
  ): Observable<StepResult<IStep>> {
    return of(true).pipe(
      tap(() => this.log.debug(`步骤延迟:${this.delay}ms`)),
      delay(this.delay),
      switchMap(() => handler.handle(step, context))
    );
  }

  order(): number {
    return 0;
  }
}
