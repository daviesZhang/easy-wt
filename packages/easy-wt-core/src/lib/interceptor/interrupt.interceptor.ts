import {IStep, resultError, RunContext, StepHandler, StepInterceptor, StepResult,} from '@easy-wt/common';
import {Observable, of} from 'rxjs';

/**
 * 打断执行直接结束,或者暂停
 */
export class InterruptInterceptor implements StepInterceptor {
  interrupts = new Set<string>();

  intercept(
    step: IStep,
    context: RunContext,
    handler: StepHandler
  ): Observable<StepResult<IStep>> {
    if (!this.interrupts.has(context.uuid)) {
      return handler.handle(step, context);
    }
    this.interrupts.delete(context.uuid);
    return of(resultError(false, step, { message: 'step.error.interrupted' }));
  }

  order(): number {
    return 0;
  }

  removeId(uuid: string) {
    this.interrupts.delete(uuid);
  }

  interrupt(uuid: string) {
    this.interrupts.add(uuid);
  }
}
