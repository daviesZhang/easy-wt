import {IStep, resultError, RunContext, StepHandler, StepInterceptor, StepResult,} from '@easy-wt/common';
import {Observable, of} from 'rxjs';

/**
 * 打断执行,直接结束
 */
export class InterruptInterceptor implements StepInterceptor {
  intercept(
    step: IStep,
    context: RunContext,
    handler: StepHandler
  ): Observable<StepResult<IStep>> {
    if (!context.interrupted()) {
      return handler.handle(step, context);
    }
    return of(resultError(false, step, { message: 'step.error.interrupted' }));
  }
}