import {
  CaseEvent,
  CaseStepEvent,
  IStep,
  RunContext,
  StepHandler,
  StepInterceptor,
  StepResult,
} from '@easy-wt/common';
import { Observable, of, switchMap, tap } from 'rxjs';
import { Logger } from '@nestjs/common';

import { EventEmitter } from 'events';

export class NoticeStepInterceptor implements StepInterceptor {
  logger = new Logger('NoticeStepInterceptor');

  constructor(private event: EventEmitter) {}

  intercept(
    step: IStep,
    context: RunContext,
    handler: StepHandler
  ): Observable<StepResult<IStep>> {
    return of(true).pipe(
      tap(() => {
        this.event.emit(CaseEvent.STEP_BEGIN, {
          step,
          uuid: context.uuid,
          runCount: context.getStepCount(step.id),
          caseRunCount: context.getRunCount(),
        } as CaseStepEvent);
      }),
      switchMap(() => handler.handle(step, context)),
      tap((next) => {
        this.event.emit(CaseEvent.STEP_END, {
          step,
          uuid: context.uuid,
          runCount: context.getStepCount(step.id),
          result: next,
          caseRunCount: context.getRunCount(),
        } as CaseStepEvent);
      })
    );
  }

  order(): number {
    return -1;
  }
}
