import {
  RunContext,
  IStep,
  StepHandler,
  StepInterceptor,
  StepResult,
} from '@easy-wt/common';
import { Observable, switchMap, take, timer } from 'rxjs';

/**
 * 支持延迟执行功能的拦截器
 */
export class DelayStepInterceptor implements StepInterceptor {
  delay: number;

  constructor(delay: number) {
    this.delay = delay;
  }

  intercept(
    step: IStep,
    context: RunContext,
    handler: StepHandler
  ): Observable<StepResult<IStep>> {
    return timer(this.delay).pipe(
      take(1),
      switchMap(() => handler.handle(step, context))
    );
  }
}
