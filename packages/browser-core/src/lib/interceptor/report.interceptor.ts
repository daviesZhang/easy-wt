import {
  ActionResult,
  IScriptCase,
  IStep,
  Report,
  RunContext,
  STEP_CONFIG,
  StepHandler,
  StepInterceptor,
  StepResult,
  StepResultError,
} from '@easy-wt/common';
import {defer, Observable} from 'rxjs';
import {Logger} from '@nestjs/common';

/**
 * 生成报告数据
 */

export class ReportInterceptor implements StepInterceptor {
  private scriptCase: IScriptCase;

  private stepMap = new Map<number, ActionResult<IStep>>();

  private logger = new Logger('ReportInterceptor');

  /**
   * 用例开始事件
   * @private
   */
  private readonly beginTime: number;

  private context: RunContext | null = null;

  constructor(scriptCase: IScriptCase) {
    this.beginTime = new Date().getTime();
    this.scriptCase = scriptCase;
    scriptCase.steps.forEach((step) => {
      step.id != null &&
        this.stepMap.set(step.id, { step: { ...step }, count: 0 });
    });
  }

  error(error: Error, context: RunContext) {
    if (error instanceof StepResultError) {
      const step = error.step;
      if (step.id == null) {
        return;
      }
      const count = context.getStepCount(step.id);
      const stepEndTime = new Date().getTime();
      const result: ActionResult<IStep> = {
        ...this.stepMap.get(step.id),
        ...error,
        end: stepEndTime,
        count,
      };
      this.stepMap.set(step.id, result);
    }
  }

  next(actionResult: ActionResult<IStep>, context: RunContext) {
    const step = actionResult.step;
    if (typeof step.id !== 'number') {
      return;
    }
    const count = context.getStepCount(step.id);
    const result: ActionResult<IStep> = {
      ...this.stepMap.get(step.id),
      ...actionResult,
      end: new Date().getTime(),
      count,
    };
    this.stepMap.set(step.id, result);
  }

  intercept(
      step: IStep,
      context: RunContext,
      handler: StepHandler
  ): Observable<StepResult<IStep>> {
    let stepBeginTime: number;

    return defer(() => {
      stepBeginTime = new Date().getTime();
      this.context = context;
      if (typeof step.id === 'number') {
        this.stepMap.set(step.id, {begin: stepBeginTime, step});
      }
      return handler.handle(step, context);
    });
  }

  getResult(): Array<ActionResult<IStep>> {
    return Array.from(this.stepMap.values()).sort(
      (a, b) => (a.step!.sort || 0) - (b.step!.sort || 0)
    );
  }

  reportGenerate(): Report {
    const actions: Array<ActionResult<IStep>> = this.getResult();
    const enabledActions = actions.filter((action) => action.step.enable);
    const errorSteps = actions.filter((action) => action.success === false);
    const totalCheck = enabledActions.filter(
      (action) => STEP_CONFIG[action.step.type!].operateType === 'check'
    ).length;
    const successCount = enabledActions.filter(
      (step) =>
        STEP_CONFIG[step.step.type!].operateType === 'check' && step.success
    ).length;
    const casePath = [...(this.context!.casePath as string[])];
    const browserType = this.context!.browserType!;
    const name = casePath.pop();

    return {
      runCount: this.context!.getRunCount(),
      actions: actions,
      totalCheck,
      successCount,
      success: !errorSteps.length && totalCheck === successCount,
      caseId: this.scriptCase.id,
      beginTime: this.beginTime,
      endTime: new Date().getTime(),
      name: name,
      uuid: this.context?.runConfig?.uuid,
      browserType,
      casePath: `${casePath.join('/')}`,
      outputPath: this.context!.uuid,
    } as Report;
  }

  /**
   * 让报告拦截器最先执行,记录用例开始的时间
   */
  order(): number {
    return -Number.MAX_VALUE;
  }
}
