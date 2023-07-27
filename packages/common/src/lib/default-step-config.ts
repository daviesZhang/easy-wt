import { StepType } from './common';
import {
  CheckElementExist,
  CheckElementText,
  ClickElement,
  ClickLink,
  InputText,
  Keyboard,
  Mouse,
  OpenBrowser,
  OpenPage,
  PutParams,
  RunScript,
  Screenshot,
  Wait,
} from './step';

export const DEFAULT_TIMEOUT = 5000;

/**
 * 每一种步骤类型 所对应的字段是否可填写和提示
 */
export interface StepTypeConfig {
  expression: {
    tip?: string;
    edit: boolean;
    type?: 'string' | 'number';
  };
  selector: {
    tip?: string;
    edit: boolean;
  };

  [key: string]: {
    tip?: string;
    edit: boolean;
    type?: 'string' | 'number';
  };
}

/**
 * 每一种步骤类型 所需要填写的内容和提示
 */
export type stepTypeConfig = {
  [StepType.OPEN_PAGE]: StepTypeConfig;
  [StepType.CHECK_ELEMENT_EXIST]: StepTypeConfig;
  [StepType.CLICK_LINK]: StepTypeConfig;
  [StepType.KEYBOARD]: StepTypeConfig;
  [StepType.CLICK_ELEMENT]: StepTypeConfig;
  [StepType.CHECK_ELEMENT_TEXT]: StepTypeConfig;
  [StepType.SCREENSHOT]: StepTypeConfig;
  [StepType.WAIT]: StepTypeConfig;
  [StepType.OPEN_BROWSER]: StepTypeConfig;
  [StepType.INPUT_TEXT]: StepTypeConfig;
  [StepType.PUT_PARAMS]: StepTypeConfig;
  [StepType.MOUSE]: StepTypeConfig;
  [StepType.RUN_SCRIPT]: StepTypeConfig;
  [key: string]: StepTypeConfig;
};

/**
 * 每一种步骤类型,对应的输入框是否可以用以及输入提示
 */
export const STEP_TYPE_CONFIG: stepTypeConfig = {
  [StepType.OPEN_PAGE]: {
    selector: { edit: false },
    expression: { edit: true, tip: '请填写需要打开的网址,必须以http开头~' },
  },
  [StepType.CHECK_ELEMENT_EXIST]: {
    selector: {
      edit: true,
      tip: '请填写检查元素的选择器',
    },
    expression: { edit: false },
  },
  [StepType.CLICK_LINK]: {
    selector: { edit: true, tip: '请填写需要点击链接的选择器' },
    expression: { edit: false },
  },
  [StepType.KEYBOARD]: {
    selector: { edit: false },
    expression: { edit: true, tip: '请填写需要操作的按键或者内容' },
  },
  [StepType.CLICK_ELEMENT]: {
    selector: { edit: true, tip: '请填写需要点击元素的选择器' },
    expression: { edit: false },
  },
  [StepType.CHECK_ELEMENT_TEXT]: {
    selector: { edit: true, tip: '请填写需要检查元素的选择器' },
    expression: { edit: true, tip: '请填写待匹配的字符~' },
  },
  [StepType.SCREENSHOT]: {
    selector: {
      edit: true,
      tip: '如果填写选择器,则截图选择器内容,否截图页面内容',
    },
    expression: { edit: false },
  },
  [StepType.WAIT]: {
    selector: { edit: true, tip: '如果选择器不为空,等待元素出现~' },
    expression: {
      edit: true,
      tip: '如果不为空,等待特定时间(毫秒)~',
      type: 'number',
    },
  },
  [StepType.OPEN_BROWSER]: {
    selector: { edit: false },
    expression: { edit: false },
  },
  [StepType.INPUT_TEXT]: {
    selector: { edit: true, tip: '需要输入的输入框元素选择器' },
    expression: { edit: true, tip: '需要输入的内容' },
  },
  [StepType.PUT_PARAMS]: {
    selector: {
      edit: true,
      tip: '如果元素选择器不为空,则获取对应元素的文本存入变量',
    },
    expression: { edit: true, tip: '如果元素选择器为空,则将此项内容存入变量' },
  },
  [StepType.RUN_SCRIPT]: {
    selector: { edit: false },
    expression: { edit: true, tip: '脚本,拥有context,step,options变量' },
  },
  [StepType.MOUSE]: {
    selector: { edit: false },
    expression: { edit: false },
  },
  [StepType.SELECT_PAGE]: {
    selector: { edit: false },
    expression: {
      edit: true,
      tip: '如果是数字,按照顺序否则按照页面URL模糊匹配',
    },
  },
  [StepType.PAGE_LOCATOR]: {
    selector: { edit: true },
    expression: { edit: false },
  },
  [StepType.STRUCT_IF]: {
    selector: { edit: true, tip: '如果选择器元素存在' },
    expression: { edit: true, tip: '如果表达式成立' },
  },
  [StepType.STRUCT_WHILE]: {
    selector: { edit: true, tip: '如果选择器元素存在' },
    expression: { edit: true, tip: '如果表达式成立' },
  },
};

export type typeOptions = {
  [StepType.OPEN_PAGE]: Partial<OpenPage['options']>;
  [StepType.CHECK_ELEMENT_EXIST]: Partial<CheckElementExist['options']>;
  [StepType.CLICK_LINK]: Partial<ClickLink['options']>;
  [StepType.KEYBOARD]: Partial<Keyboard['options']>;
  [StepType.CLICK_ELEMENT]: Partial<ClickElement['options']>;
  [StepType.CHECK_ELEMENT_TEXT]: Partial<CheckElementText['options']>;
  [StepType.SCREENSHOT]: Partial<Screenshot['options']>;
  [StepType.WAIT]: Partial<Wait['options']>;
  [StepType.OPEN_BROWSER]: Partial<OpenBrowser['options']>;
  [StepType.INPUT_TEXT]: Partial<InputText['options']>;
  [StepType.PUT_PARAMS]: Partial<PutParams['options']>;
  [StepType.RUN_SCRIPT]: Partial<RunScript['options']>;
  [StepType.MOUSE]: Partial<Mouse['options']>;
};
/**
 * 默认配置
 */
export const DEFAULT_OPTIONS: typeOptions = {
  [StepType.OPEN_PAGE]: {},
  [StepType.CHECK_ELEMENT_EXIST]: {
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

  [StepType.CLICK_LINK]: {
    timeout: DEFAULT_TIMEOUT,
  },
  [StepType.MOUSE]: {
    type: 'down',
    mouseButton: 'left',
  },

  [StepType.KEYBOARD]: {
    type: 'press',
  },
  [StepType.CLICK_ELEMENT]: { delay: 500, clickCount: 1 },
  [StepType.CHECK_ELEMENT_TEXT]: {
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
  [StepType.SCREENSHOT]: {
    //是否全页面截图
    fullPage: false,
    //base64|binary
    encoding: 'binary',
  },
  [StepType.WAIT]: {
    //超时时间
    timeout: DEFAULT_TIMEOUT,
  },
  [StepType.OPEN_BROWSER]: {
    //使用无头浏览器
    headless: true,
  },
  [StepType.INPUT_TEXT]: {
    //是否绕过可操作性检查
    force: false,
    timeout: DEFAULT_TIMEOUT,
    //超时
    //delay: ,
  },
  [StepType.PUT_PARAMS]: {
    //简单模式,不以表达式计算
    simple: false,
  },
  [StepType.RUN_SCRIPT]: {},
};
