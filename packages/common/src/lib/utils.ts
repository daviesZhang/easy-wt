import {IStep} from './step';
import {StepResult, StepResultData} from './common';
import {IScriptCase, RunConfig} from './script-case';

import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import isDate from 'lodash/isDate';
import cloneDeepWith from 'lodash/cloneDeepWith';
import {format} from 'date-fns';

/**
 * 返回成功
 * @param next
 * @param step
 * @param data
 */
export function resultSuccess<R extends IStep>(
  next: boolean,
  step: R,
  data?: StepResultData
): StepResult<R> {
  return { step: step, data, next, success: true };
}

/**
 * 返回异常
 * @param next
 * @param step
 * @param data
 */
export function resultError<R extends IStep>(
  next: boolean,
  step: R,
  data?: StepResultData
): StepResult<R> {
  return { step: step, data, success: false, next };
}

/**
 * 判断用例运行时配置的值是不是空
 * 对于空数组 认为是空,
 * @param value
 */
function runConfigValueIsNull(value: unknown): boolean {
  if (Array.isArray(value)) {
    return !value.length;
  }
  if (typeof value === 'number') {
    return false;
  }
  return !value;
}

/**
 * 合并运行时配置
 * 优先级从下到上.底部配置会覆盖父级配置
 * @param scriptCase
 * @param extRunConfig 一次性传入的扩展配置,优先级最高
 */
export function margeRunConfig(
  scriptCase: Partial<IScriptCase>,
  extRunConfig: Partial<RunConfig> = {}
): Partial<RunConfig> {
  let usedRunConfig = Object.assign({}, extRunConfig) as Partial<RunConfig>;
  if (!scriptCase) {
    return extRunConfig;
  }
  const { runConfig } = scriptCase;
  if (runConfig) {
    const keys = Object.keys(runConfig) as Array<keyof Partial<RunConfig>>;
    keys.forEach((key) => {
      const value = runConfig[key as keyof Partial<RunConfig>];
      const usedValue = usedRunConfig[key as keyof Partial<RunConfig>];
      if (key === 'runParams') {
        usedRunConfig.runParams = Object.assign({}, value, usedRunConfig[key]);
      } else {
        if (runConfigValueIsNull(usedValue) && !runConfigValueIsNull(value)) {
          Object.assign(usedRunConfig, { [key]: value });
        }
      }
    });
  }
  if (scriptCase.parent) {
    usedRunConfig = margeRunConfig(scriptCase.parent, usedRunConfig);
  }
  return usedRunConfig;
}

/**
 * 转换类型
 * 去掉空参数,转换时间格式,去掉字符串前后空格
 * @param params
 * @param config
 * emptyStringToNull 把空字符串转换为null
 * dateFormat 日期转换为字符串,不填默认getTime
 */
export function transformParams(
    params: { [key: string]: any } = {},
    config?: {
      emptyStringToNull?: boolean;
      dateFormat?: string;
      emptyArrayToNull?: boolean;
    }
): any {
  const {emptyStringToNull, emptyArrayToNull, dateFormat} =
      Object.assign(
          {},
          {emptyArrayToNull: true, emptyStringToNull: true,}, config
      );
  return cloneDeepWith(params, (value): any => {
    if (isDate(value)) {
      if (dateFormat) {
        return format(value, dateFormat);
      } else {
        return value.getTime();
      }
    }
    if (isArray(value) && !value.length && emptyArrayToNull) {
      return null;
    }
    if (isString(value)) {
      if ('' === value) {
        if (emptyStringToNull) {
          return null;
        }
      } else {
        return value.trim();
      }
    }
  });
}
