import { Injectable } from '@nestjs/common';
import {
  IStep,
  RunContext,
  STEP_CONFIG,
  StepHandler,
  StepInterceptor,
  StepResult,
} from '@easy-wt/common';
import { defer, Observable } from 'rxjs';
import cloneDeepWith from 'lodash/cloneDeepWith';
import isString from 'lodash/isString';
import template from 'lodash/template';
import { getNanoIdSync } from '../utils';
import path from 'path';
import { format } from 'date-fns';
import { Page } from 'playwright';
import partialRight from 'lodash/partialRight';
import assignInWith from 'lodash/assignInWith';
import isNil from 'lodash/isNil';
import isPlainObject from 'lodash/isPlainObject';

@Injectable()
export class BeforeInterceptor implements StepInterceptor {
  defaultOptions: (...args: any[]) => any = partialRight(
    assignInWith,
    (a: any, b: any) => {
      if (isNil(b) || b === '') {
        return a;
      }
    }
  );

  cloneDeepAndReplace(step: IStep, context: RunContext) {
    const params = Object.assign(
      this.innerFunction(context),
      Object.fromEntries(context.runParams.entries())
    );
    return cloneDeepWith(step, (value: unknown) =>
      this.cloneCustomizer(params, value)
    );
  }

  cloneCustomizer(params: { [key: string]: unknown }, value: unknown): any {
    if (isString(value)) {
      const compiled = template(value);
      const newValue = compiled(params);
      return /^\d+$/.test(newValue) ? parseInt(newValue, 10) : newValue;
    }
  }

  innerFunction(context: RunContext) {
    return {
      nanoid: () => getNanoIdSync(),
      output: context.environmentConfig ? context.environmentConfig.output : '',
      report_path: path.join(
        context.environmentConfig ? context.environmentConfig.output : '',
        context.uuid
      ),
      date_str: () => format(new Date(), 'yyyy-MM-dd'),
      time_str: () => format(new Date(), 'HH:mm:ss'),
      path_sep: path.sep,
      page_url: () => {
        if (context.page) {
          const page = context.page as Page;
          return page.url();
        }
        return '';
      },
      random_number: (max: number, min = 0) =>
        Math.floor(Math.random() * (max - min + 1) + min),
    };
  }

  dropNullUndefined(d: any): any {
    return Object.entries(d).reduce(
      (acc, [k, v]) =>
        isNil(v)
          ? acc
          : { ...acc, [k]: isPlainObject(v) ? this.dropNullUndefined(v) : v },
      {}
    );
  }

  intercept(
    step: IStep,
    context: RunContext,
    handler: StepHandler
  ): Observable<StepResult<IStep>> {
    return defer(() => {
      /**
       * 拷贝一份step
       */
      const copyStep: IStep = this.cloneDeepAndReplace(step, context);
      /**
       * 给步骤选项部分套上默认值,并去掉空内容
       */
      const options = this.defaultOptions(
        {},
        STEP_CONFIG[copyStep.type].options,
        copyStep.options || {}
      );
      copyStep.options = this.dropNullUndefined(options);
      context.addStepCount(copyStep.id!);
      return handler.handle(copyStep, context);
    });
  }
}
