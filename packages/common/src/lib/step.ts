import {CheckPattern, KeyboardEvent, StepType} from './common';
import {IScriptCase} from './script-case';
import {mouseButton, mouseEvent} from './step-options';

/**
 * 步骤
 */
export interface IStep {
  id?: number | null;

  caseId?: number;

  name: string;

  type?: StepType;

  sort?: number;

  options?: unknown;

  selector?: Selector;

  desc?: string;

  expression?: string;

  scriptCase?: IScriptCase;

  enable?: boolean;
}

export type step = Omit<IStep, 'scriptCase'>;
export const SELECTOR_TYPE: Readonly<Array<string>> = [
  'Role',
  'AltText',
  'Placeholder',
  'Text',
  'Title',
  'Label',
  'Css',
  'XPath',
] as const;

export type selectorType = (typeof SELECTOR_TYPE)[number];

export interface Selector {
  type: selectorType;
  value: string;
  name?: string;
  nth?: number;
  exact?: boolean;
  filter?: 'hasText' | 'hasNotText';
  filterValue?: string;

  connect?: 'and' | 'or' | 'locator';
}

export class Step implements IStep {
  id: number | null = null;
  caseId?: number;
  name!: string;
  type?: StepType;
  sort?: number;
  selector?: Selector;
  desc?: string;
  options?: unknown;
  expression?: string;
  scriptCase?: IScriptCase;

  enable?: boolean;
}

export type ScreenshotOptions = {
  alwaysScreenshot?: boolean;
  element?: boolean;
  path?: string;
  fullPage?: boolean;
  encoding?: 'base64' | 'binary';
};

export class CheckElementExist implements IStep {
  name: string;
  type: StepType;
  selector: Selector;

  options: ScreenshotOptions & {
    timeout?: number;
    exist: boolean;
    failedContinue: boolean;
  } = {
    failedContinue: false,
    exist: true,
    fullPage: false,
  };

  constructor(name: string, selector: Selector) {
    this.name = name;
    this.selector = selector;
    this.type = StepType.CHECK_ELEMENT_EXIST;
  }
}

export class Keyboard implements IStep {
  name: string;
  type: StepType;

  expression: string;

  options: { type: KeyboardEvent } = { type: 'down' };

  constructor(
    name: string,
    expression: string,
    options: { type: KeyboardEvent }
  ) {
    this.name = name;
    this.expression = expression;
    this.type = StepType.KEYBOARD;
    this.options = options;
  }
}

export class CheckElementText implements IStep {
  name: string;
  type: StepType;
  selector: Selector;
  expression: string;
  options: ScreenshotOptions & {
    pattern?: CheckPattern;
    timeout?: number;
    failedContinue: boolean;
  } = { failedContinue: false };

  constructor(name: string, selector: Selector, expression: string) {
    this.name = name;
    this.selector = selector;
    this.type = StepType.CHECK_ELEMENT_TEXT;
    this.expression = expression;
  }
}

export class Screenshot implements IStep {
  name: string;
  type: StepType;

  selector?: Selector;
  options: {
    path?: string;
    fullPage?: boolean;
    encoding?: 'base64' | 'binary';
  } = { fullPage: false, encoding: 'binary' };

  constructor(name: string) {
    this.name = name;
    this.type = StepType.SCREENSHOT;
  }
}

export class Wait implements IStep {
  name: string;
  type: StepType;
  /**
   * 纯数字=等待特定时间  //开头,等待xpath元素出现, 其他情况灯带css选择器元素出现
   */
  expression: string;

  selector?: Selector;

  options?: { timeout: number };

  constructor(name: string, expression: string) {
    this.name = name;
    this.expression = expression;
    this.type = StepType.WAIT;
  }
}

export class Mouse implements IStep {
  name: string;

  options?: {
    type: mouseEvent;
    x?: number;
    y?: number;
    mouseButton?: mouseButton;
  };

  type: StepType;

  constructor(name: string, options: Mouse['options']) {
    this.name = name;
    this.type = StepType.MOUSE;
    this.options = options;
  }
}

export class RunScript implements IStep {
  name: string;
  type: StepType;

  expression: string;

  options?: { timeout: number };

  constructor(name: string, expression: string) {
    this.name = name;
    this.expression = expression;
    this.type = StepType.RUN_SCRIPT;
  }
}

export class ClickElement implements IStep {
  name: string;

  selector: Selector;

  type: StepType;

  options?: {
    delay?: number;
    clickCount?: number;
    timeout?: number;
    button?: mouseButton;
  };

  constructor(name: string, selector: Selector) {
    this.name = name;
    this.selector = selector;
    this.type = StepType.CLICK_ELEMENT;
  }
}

export class ClickLink implements IStep {
  name: string;
  selector: Selector;
  type: StepType;
  options?: { timeout?: number; switchPage?: boolean };

  constructor(name: string, selector: Selector) {
    this.name = name;
    this.selector = selector;
    this.type = StepType.CLICK_LINK;
  }
}

export class StructWhile implements IStep {
  name: string;
  type: StepType;
  expression?: string;
  selector?: Selector;

  constructor(name: string, expression?: string) {
    this.name = name;
    this.expression = expression;
    this.type = StepType.STRUCT_WHILE;
  }
}

export class StructEndwhile implements IStep {
  name: string;
  type: StepType;

  constructor(name: string) {
    this.name = name;
    this.type = StepType.STRUCT_ENDWHILE;
  }
}

export class StructIf implements IStep {
  name: string;
  type: StepType;
  expression?: string;
  selector?: Selector;

  constructor(name: string, expression?: string) {
    this.name = name;
    this.expression = expression;
    this.type = StepType.STRUCT_IF;
  }
}

export class StructElse implements IStep {
  name: string;
  type: StepType;

  constructor(name: string) {
    this.name = name;
    this.type = StepType.STRUCT_ELSE;
  }
}

export class StructEndIf implements IStep {
  name: string;
  type: StepType;

  constructor(name: string) {
    this.name = name;
    this.type = StepType.STRUCT_ENDIF;
  }
}

export class OpenBrowser implements IStep {
  name: string;

  type: StepType;

  options?: {
    executablePath?: string;
    headless?: boolean;
    devicesName?: string;
    userAgent?: string;
    width?: number;
    height?: number;
    deviceScaleFactor?: number;
    recordVideo?: boolean;
  } & Record<string, unknown>;

  constructor(name: string) {
    this.name = name;
    this.type = StepType.OPEN_BROWSER;
  }
}

export class SelectPage implements IStep {
  name: string;

  type: StepType;

  options?: Record<string, unknown>;

  constructor(name: string) {
    this.name = name;
    this.type = StepType.SELECT_PAGE;
  }
}

export class CloseBrowser implements IStep {
  name: string;
  type: StepType;

  options?: { [key: string]: any };

  constructor(name: string) {
    this.name = name;
    this.type = StepType.CLOSE_BROWSER;
  }
}

export class InputText implements IStep {
  name: string;
  type: StepType;

  selector: Selector;
  options?: { timeout?: number; force?: boolean };
  expression: string;

  constructor(name: string, selector: Selector, expression: string) {
    this.name = name;
    this.selector = selector;
    this.expression = expression;
    this.type = StepType.INPUT_TEXT;
  }
}

export class OpenPage implements IStep {
  name: string;
  type: StepType;
  expression: string;
  options?: Record<string, unknown>;

  constructor(name: string, expression: string) {
    this.name = name;
    this.expression = expression;
    this.type = StepType.OPEN_PAGE;
  }
}

export class PutParams implements IStep {
  name: string;
  type: StepType;

  selector?: Selector;
  expression?: string;

  options: { key: string; simple?: boolean; attr?: string };

  constructor(
    name: string,
    options: { key: string; simple: boolean },
    expression?: string
  ) {
    this.name = name;
    this.options = options;
    this.type = StepType.PUT_PARAMS;
    this.expression = expression;
  }
}

/**
 * 页面选择器
 */
export class PageLocator implements IStep {
  name: string;
  type: StepType;

  selector: Selector;

  expression?: string;

  constructor(name: string, selector: Selector) {
    this.name = name;
    this.selector = selector;
    this.type = StepType.PAGE_LOCATOR;
  }
}

/**
 * 保存文本
 */
export class TextSave implements IStep {
  name: string;

  type: StepType;

  selector: Selector;

  expression?: string;

  options: {
    attr?: string;
    filePath: string;
    overwrite: boolean;
    autoClose: boolean;
  };

  constructor(name: string, selector: Selector, options: TextSave['options']) {
    this.name = name;
    this.selector = selector;
    this.type = StepType.TEXT_SAVE;
    this.options = options;
  }
}

export class TextSaveClose implements IStep {
  name: string;

  type: StepType;

  expression?: string;

  constructor(name: string, expression: string) {
    this.name = name;

    this.type = StepType.TEXT_SAVE_CLOSE;
    this.expression = expression;
  }
}
