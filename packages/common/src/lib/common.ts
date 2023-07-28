import {IStep} from './step';

/**
 * 支持的浏览器
 *
 */
export const supportBrowserType = ['chromium', 'firefox', 'webkit'] as const;

export type SupportBrowserType = (typeof supportBrowserType)[number];

export const supportDBType = ['sqlite', 'mysql'] as const;

export type SupportDBType = (typeof supportDBType)[number];

/**
 * 步骤类型
 */
export enum StepType {
  /**
   * 打开浏览器
   */
  OPEN_BROWSER = 'OPEN_BROWSER',
  /**
   * 关闭浏览器
   */
  CLOSE_BROWSER = 'CLOSE_BROWSER',
  /**
   * 打开新的页面
   */
  OPEN_PAGE = 'OPEN_PAGE',
  /**
   * 输入
   */
  INPUT_TEXT = 'INPUT_TEXT',
  /**
   * 单击元素
   */
  CLICK_ELEMENT = 'CLICK_ELEMENT',
  /**
   * 单击后跳转
   */
  CLICK_LINK = 'CLICK_LINK',
  /**
   * 设置变量
   */

  PUT_PARAMS = 'PUT_PARAMS',
  /**
   * 开始IF结构
   */
  STRUCT_IF = 'STRUCT_IF',
  /**
   * ELSE结构
   */
  STRUCT_ELSE = 'STRUCT_ELSE',
  /**
   * IF 结束
   */
  STRUCT_ENDIF = 'STRUCT_ENDIF',
  /**
   * WHILE开始
   */
  STRUCT_WHILE = 'STRUCT_WHILE',
  /**
   * WHILE结束
   */
  STRUCT_ENDWHILE = 'STRUCT_ENDWHILE',
  /**
   * 等待
   */
  WAIT = 'WAIT',
  /**
   * 截图
   */
  SCREENSHOT = 'SCREENSHOT',
  /**
   * 检查 元素存在
   */
  CHECK_ELEMENT_EXIST = 'CHECK_ELEMENT_EXIST',

  /**
   *  检查元素 文本内容是否符合预期
   */
  CHECK_ELEMENT_TEXT = 'CHECK_ELEMENT_TEXT',

  /**
   * 切换页面
   */
  SELECT_PAGE = 'SELECT_PAGE',
  /**
   * 键盘输入
   */
  KEYBOARD = 'KEYBOARD',

  /**
   * node环境下运行脚本
   */
  RUN_SCRIPT = 'RUN_SCRIPT',
  /**
   * 鼠标操作
   */
  MOUSE = 'MOUSE',

  /**
   * 定位器
   */
  PAGE_LOCATOR = 'PAGE_LOCATOR',

  /**
   * txt save
   */
  TXT_SAVE = 'TXT_SAVE',
  /**
   * image save
   */
  IMAGE_SAVE = 'IMAGE_SAVE',
}

/**
 * 检查文字类的操作符
 */
export const CHECK_PATTERN = [
  'STARTS_WITH',
  'ENDS_WITH',
  'CONTAINS',
  'NOT_CONTAINS',
  'LT',
  'LE',
  'EQUALS',
  'NOT_EQUALS',
  'GE',
  'GT',
  'EXP',
] as const;

export type CheckPattern = (typeof CHECK_PATTERN)[number];

export const KEYBOARD_EVENT = ['type', 'press', 'down', 'up'] as const;
export type KeyboardEvent = (typeof KEYBOARD_EVENT)[number];

/**
 * 排序查询的条件
 */
export interface OrderBy {
  [key: string]: 'order' | 'asc';
}

/**
 * 数据分页查询参数
 */
export interface QueryParams {
  size?: number;
  current?: number;
  orderBys?: OrderBy;
  params: { [key: string]: unknown };
}

export interface ActionResult<R> extends StepResult<R> {
  begin?: number;
  end?: number;
  /**
   * 执行的次数
   */
  count?: number;
}

/**
 * 步骤结果数据
 */
export interface StepResultData {
  screenshot?: string;

  message?: string;

  video?: string;

  [key: string]: unknown;
}

/**
 * 步骤结果
 */
export interface StepResult<R> {
  /**
   * 步骤
   */
  step: R;
  /**
   * 执行结果是否成功
   */
  success?: boolean;
  /**
   * 是否继续下一步
   */
  next?: boolean;
  /**
   * 步骤获得的需要传递的数据
   */
  data?: StepResultData;
}

export class StepResultError implements Error, StepResult<IStep> {
  step: IStep;
  success?: boolean | undefined;
  next?: boolean | undefined;
  data?: StepResultData | undefined;
  name: string;
  message: string;

  constructor(data: StepResult<IStep> & Error) {
    this.step = data.step;
    this.name = data.name;
    this.message = data.message;
    this.next = typeof data.next === 'boolean' ? data.next : false;
    this.success = false;
    this.data = data.data;
  }
}
