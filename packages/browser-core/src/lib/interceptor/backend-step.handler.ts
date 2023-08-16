import {IStep, RunContext, StepAction, StepHandler, StepResult,} from '@easy-wt/common';
import {defer, Observable} from 'rxjs';
import {Logger} from '@nestjs/common';


/**
 *
 * 最后兜底实际执行对应逻辑的拦截器
 */
export class BackendStepHandler implements StepHandler {
  action: StepAction<IStep>;

  logger = new Logger(BackendStepHandler.name);

  constructor(action: StepAction<IStep>) {
    this.action = action;
  }

  /**
   * 步骤执行
   *
   * @param step
   * @param context
   */
  handle(step: IStep, context: RunContext): Observable<StepResult<IStep>> {
    return defer(() => this.action.run(step, context));
  }
}
