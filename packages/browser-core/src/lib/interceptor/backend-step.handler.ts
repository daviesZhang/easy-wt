import {
  IStep,
  RunContext,
  STEP_CONFIG,
  StepAction,
  StepHandler,
  StepResult,
} from '@easy-wt/common';
import { defer, Observable } from 'rxjs';
import { getNanoIdSync } from '../utils';
import {
  assignInWith,
  cloneDeepWith,
  isNil,
  isString,
  partialRight,
  template,
} from 'lodash';
import { Logger } from '@nestjs/common';
import { format } from 'date-fns';

function cloneDeepAndReplace(step: IStep, context: RunContext) {
  const params = Object.assign(
    innerFunction(context),
    Object.fromEntries(context.runParams.entries())
  );
  return cloneDeepWith(step, (value: unknown) =>
    cloneCustomizer(params, value)
  );
}

function cloneCustomizer(
  params: { [key: string]: unknown },
  value: unknown
): any {
  if (isString(value)) {
    const compiled = template(value);
    return compiled(params);
  }
}

function innerFunction(context: RunContext) {
  return {
    nanoid: () => getNanoIdSync(),
    output: context.environmentConfig ? context.environmentConfig.output : '',
    date_str: () => format(new Date(), 'yyyy-MM-dd'),
    time_str: () => format(new Date(), 'HH:mm:ss'),
  };
}

const defaultOptions: (...args: any[]) => any = partialRight(
  assignInWith,
  (a: any, b: any) => {
    if (isNil(b) || b === '') {
      return a;
    }
  }
);

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
   * 首先把全部参数,配置里面的占位符${}变量找出来替换成实际的值,然后执行对应步骤的run方法
   * @param step
   * @param context
   */
  handle(step: IStep, context: RunContext): Observable<StepResult<IStep>> {
    return defer(() => {
      /**
       * 拷贝一份step
       */
      const copyStep: IStep = cloneDeepAndReplace(step, context);
      copyStep.options = defaultOptions(
        {},
        STEP_CONFIG[copyStep.type!].options,
        copyStep.options || {}
      );
      context.addStepCount(copyStep.id!);
      return defer(() => this.action.run(copyStep, context));
    });
  }
}
