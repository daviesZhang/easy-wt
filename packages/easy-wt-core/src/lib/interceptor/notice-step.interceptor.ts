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
        if (!context.previousResult) {
          //没有上一个的执行结果,意味着是第一个,触发用例开始事件
          this.event.emit(CaseEvent.CASE_BEGIN, {
            browserType: context.browserType,
            runConfig: context.runConfig,
            scriptCase: context.scriptCase,
          });
        }
        this.event.emit(CaseEvent.STEP_BEGIN, {
          step,
          runCount: context.getStepCount(step.id),
          caseRunCount: context.getRunCount(),
        } as CaseStepEvent);
      }),
      switchMap(() => handler.handle(step, context)),
      tap((next) => {
        this.event.emit(CaseEvent.STEP_END, {
          step,
          runCount: context.getStepCount(step.id),
          result: next,
          caseRunCount: context.getRunCount(),
        } as CaseStepEvent);
      })
    );
  }

  order(): number {
    return 0;
  }
}
