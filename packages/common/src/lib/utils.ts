import {IStep} from './step';
import {StepResult, StepResultData} from './common';
import {IScriptCase, RunConfig} from './script-case';

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
 * 拷贝对象
 * @param target
 * @param source
 */
export function copyProperties(target: object, ...source: Array<any>): any {
  target = target || {};
  for (const object of source) {
    if (!object) {
      continue;
    }
    Object.keys(object).forEach((key) => {
      const newValue = object[key];
      if (newValue !== undefined && newValue !== null && newValue !== '') {
        // @ts-ignore
        target[key] = newValue;
      }
    });
  }
  return target;
}

export function copyProperties2<T extends object, U, V>(
  t: T,
  u: U,
  v: V
): Partial<T & U & V> {
  return copyProperties(t, u, v);
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
 * 转换查询参数
 * 去掉空参数,转换时间格式,去掉字符串前后空格
 * @param params
 * @param timestamp 对于时间是否转换为时间戳,或根据传入时间格式转换
 * @param removeEmpty 是否移除空参数
 */
export function transformParams(params: { [key: string]: any } = {}): unknown {
  params = { ...params };
  return Object.keys(params)
    .map((key) => {
      let value = params[key];
      if (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && !value.trim()) ||
        (Array.isArray(value) && !value.length)
      ) {
        return null;
      }
      if (
        typeof value === 'object' &&
        Object.prototype.toString.call(value) === '[object Object]' &&
        Object.keys(value).length >= 1
      ) {
        return { [key]: transformParams(value) };
      }
      if (value instanceof Date) {
        value = value.getTime();
      } else if (typeof value === 'string') {
        value = value.trim();
      }
      return { [key]: value };
    })
    .filter((v) => !!v)
    .reduce(
      (previousValue, currentValue) => ({ ...previousValue, ...currentValue }),
      {}
    );
}
