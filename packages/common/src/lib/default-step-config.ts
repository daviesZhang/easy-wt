import { StepType } from './common';
import { IStep } from './step';

export const DEFAULT_TIMEOUT = 5000;

/**
 * 步骤操作的类型
 * check 检查点
 * helper 辅助类
 * operate 操作
 * other 其他
 */
export const STEP_OPERATE_TYPE = [
  'check',
  'helper',
  'operate',
  'other',
] as const;

export type stepOperateType = (typeof STEP_OPERATE_TYPE)[number];

/**
 * 每一种步骤类型 所对应的字段是否可填写和提示
 */
export interface StepTypeConfig<T extends IStep> {
  order: number;
  operateType: stepOperateType;
  disabled?: boolean;
  expression:
    | false
    | {
        //输入提示
        tip?: string;
        //是否可以编辑
        edit: boolean;
        //输入类型
        type?: 'string' | 'number';
      };
  selector: false | { edit: boolean; tip?: string };
  options: Partial<T['options']>;
}

export type stepConfig = Record<StepType, StepTypeConfig<IStep>>;

export const STEP_CONFIG: stepConfig = {
  //operate
  OPEN_BROWSER: {
    operateType: 'operate',
    order: 1,
    selector: { edit: false },
    expression: { edit: false },
    options: {
      //使用无头浏览器
      headless: true,
    },
  },
  OPEN_PAGE: {
    order: 2,
    selector: { edit: false },
    expression: { edit: true, tip: '请填写需要打开的网址,必须以http开头~' },
    options: {},
    operateType: 'operate',
  },
  CLICK_LINK: {
    operateType: 'operate',
    order: 1,
    selector: { edit: true },
    expression: { edit: false },
    options: {
      timeout: DEFAULT_TIMEOUT,
    },
  },
  KEYBOARD: {
    operateType: 'operate',
    order: 1,
    selector: { edit: false },
    expression: { edit: true, tip: '请填写需要操作的按键或者内容' },
    options: {
      type: 'press',
    },
  },
  CLICK_ELEMENT: {
    operateType: 'operate',
    order: 1,
    selector: { edit: true },
    expression: { edit: false },
    options: { delay: 500, clickCount: 1 },
  },
  SCREENSHOT: {
    operateType: 'operate',
    order: 1,
    selector: {
      edit: true,
    },
    expression: { edit: false },
    options: {
      //是否全页面截图
      fullPage: false,
      //base64|binary
      encoding: 'binary',
    },
  },
  WAIT: {
    operateType: 'operate',
    order: 1,
    selector: { edit: true },
    expression: {
      edit: true,
      tip: '如果不为空,等待特定时间(毫秒)~',
      type: 'number',
    },
    options: {
      //超时时间
      timeout: DEFAULT_TIMEOUT,
    },
  },
  INPUT_TEXT: {
    operateType: 'operate',
    order: 1,
    selector: { edit: true },
    expression: { edit: true, tip: '需要输入的内容' },
    options: {
      //是否绕过可操作性检查
      force: false,
      timeout: DEFAULT_TIMEOUT,
      //超时
      //delay: ,
    },
  },
  MOUSE: {
    operateType: 'operate',
    order: 1,
    selector: { edit: false },
    expression: { edit: false },
    options: {
      type: 'down',
      mouseButton: 'left',
    },
  },
  SELECT_PAGE: {
    operateType: 'operate',
    order: 1,
    selector: { edit: false },
    expression: {
      edit: true,
      tip: '如果是数字,按照顺序否则按照页面URL模糊匹配',
    },
    options: {},
  },
  CLOSE_BROWSER: {
    order: 1,
    selector: false,
    expression: false,
    operateType: 'operate',
    options: {},
  },

  //check
  CHECK_ELEMENT_EXIST: {
    operateType: 'check',
    order: 1,
    selector: {
      edit: true,
    },
    expression: { edit: false },
    options: {
      //总是截图,无论失败,成功
      alwaysScreenshot: true,
      //仅截图检查元素
      element: false,
      timeout: DEFAULT_TIMEOUT,
      //是否全页面截图
      fullPage: false,
      //base64|binary
      encoding: 'binary',
      //如果检查失败,是否继续执行后续步骤
      failedContinue: false,
      //检查 true元素存在 ,false 元素不存在
      exist: true,
    },
  },
  CHECK_ELEMENT_TEXT: {
    operateType: 'check',
    order: 2,
    selector: { edit: true },
    expression: { edit: true, tip: '请填写待匹配的字符~' },
    options: {
      //总是截图,无论失败,成功
      alwaysScreenshot: true,

      timeout: DEFAULT_TIMEOUT,
      //进截图检查元素
      element: false,
      //是否全页面截图
      fullPage: false,
      //base64|binary
      encoding: 'binary',
      //如果检查失败,是否继续执行后续步骤
      failedContinue: false,
      pattern: 'EQUALS',
    },
  },

  //helper
  PAGE_LOCATOR: {
    operateType: 'helper',
    order: 1,
    selector: { edit: true },
    expression: { edit: false },
    options: {},
  },
  STRUCT_IF: {
    operateType: 'helper',
    order: 2,
    selector: { edit: true },
    expression: { edit: true, tip: '如果表达式成立' },
    options: {},
  },
  STRUCT_ELSE: {
    order: 3,
    selector: false,
    expression: false,
    operateType: 'helper',
    options: {},
  },
  STRUCT_ENDIF: {
    order: 4,
    selector: false,
    expression: false,
    operateType: 'helper',
    options: {},
  },
  STRUCT_WHILE: {
    operateType: 'helper',
    order: 5,
    selector: { edit: true },
    expression: { edit: true, tip: '如果表达式成立' },
    options: {},
  },
  STRUCT_ENDWHILE: {
    order: 6,
    selector: false,
    expression: false,
    operateType: 'helper',
    options: {},
  },
  PUT_PARAMS: {
    operateType: 'helper',
    order: 7,
    selector: {
      edit: true,
    },
    expression: { edit: true, tip: '如果元素选择器为空,则将此项内容存入变量' },
    options: {
      //简单模式,不以表达式计算
      simple: false,
    },
  },

  //other
  RUN_SCRIPT: {
    operateType: 'other',
    order: 1,
    selector: { edit: false },
    expression: { edit: true, tip: '脚本,拥有context,step,options变量' },
    options: {},
  },
  IMAGE_SAVE: {
    order: 2,
    selector: false,
    expression: false,
    operateType: 'other',
    options: {},
    disabled: true,
  },
  TXT_SAVE: {
    order: 3,
    selector: false,
    expression: false,
    operateType: 'other',
    options: {},
    disabled: true,
  },
};
