import {CheckPattern, KeyboardEvent, StepType} from './common';
import {mouseButton, mouseEvent} from './step-options';


/**
 * 步骤
 */
export interface IStep {
  id: number;

  caseId: number;

  name: string;

  type: StepType;

  sort: number;

  options?: unknown;

  selector?: Selector;

  desc?: string;

  expression?: string;

  enable?: boolean;
}


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



export type ScreenshotOptions = {
  alwaysScreenshot?: boolean;
  element?: boolean;
  path?: string;
  fullPage?: boolean;
  encoding?: 'base64' | 'binary';
};

export interface CheckElementExist extends IStep {
  name: string;
  type: StepType;
  selector: Selector;

  options: ScreenshotOptions & {
    timeout?: number;
    exist: boolean;
    failedContinue: boolean;
  };
}

export interface Keyboard extends IStep {
  name: string;
  type: StepType;

  expression: string;

  options: { type: KeyboardEvent };
}

export interface CheckElementText extends IStep {
  name: string;
  type: StepType;
  selector: Selector;
  expression: string;
  options: ScreenshotOptions & {
    pattern?: CheckPattern;
    timeout?: number;
    failedContinue: boolean;
  };
}

export interface Screenshot extends IStep {
  name: string;
  type: StepType;

  selector?: Selector;
  options: {
    path?: string;
    fullPage?: boolean;
    encoding?: 'base64' | 'binary';
  };
}


export interface Wait extends IStep {
  name: string;
  type: StepType;
  /**
   * 纯数字=等待特定时间  //开头,等待xpath元素出现, 其他情况灯带css选择器元素出现
   */
  expression: string;

  selector?: Selector;

  options?: { timeout: number };
}

export interface Mouse extends IStep {
  name: string;

  options?: {
    type: mouseEvent;
    x?: number;
    y?: number;
    mouseButton?: mouseButton;
  };

  type: StepType;
}

export interface RunScript extends IStep {
  name: string;
  type: StepType;

  expression: string;

  options?: { timeout: number };
}

export interface ClickElement extends IStep {
  name: string;

  selector: Selector;

  type: StepType;

  options?: {
    delay?: number;
    clickCount?: number;
    timeout?: number;
    button?: mouseButton;
  };
}

export interface ClickLink extends IStep {
  name: string;
  selector: Selector;
  type: StepType;
  options: { timeout?: number; switchPage?: boolean };
}

/**
 * 拖放
 */
export interface DragAndDrop extends IStep {
  name: string;
  selector: Selector;
  type: StepType;
  options: {
    sourcePosition?: { x: number; y: number };
    targetPosition?: { x: number; y: number };
  };
}

export interface StructWhile extends IStep {
  name: string;
  type: StepType;
  expression?: string;
  selector?: Selector;
}

export interface StructEndwhile extends IStep {
  name: string;
  type: StepType;
}

export interface StructIf extends IStep {
  name: string;
  type: StepType;
  expression?: string;
  selector?: Selector;
}

export interface StructElse extends IStep {
  name: string;
  type: StepType;
}

export interface StructEndIf extends IStep {
  name: string;
  type: StepType;
}

export interface OpenBrowser extends IStep {
  name: string;

  type: StepType;

  options?: {
    executablePath?: string;
    defaultTimeout: number | string;
    headless?: boolean;
    devicesName?: string;
    userAgent?: string;
    width?: number;
    height?: number;
    deviceScaleFactor?: number;
    recordVideo?: boolean;
  };
}

export interface SelectPage extends IStep {
  name: string;

  type: StepType;
  expression: string;

  options?: Record<string, unknown>;
}

export interface CloseBrowser extends IStep {
  name: string;
  type: StepType;

  options?: { [key: string]: any };
}

export interface InputText extends IStep {
  name: string;
  type: StepType;

  selector: Selector;
  options?: { timeout?: number; force?: boolean };
  expression: string;
}

export interface OpenPage extends IStep {
  name: string;
  type: StepType;
  expression: string;
  options?: { timeout?: number; defaultTimeout?: number | string };
}

export interface PutParams extends IStep {
  name: string;
  type: StepType;

  selector?: Selector;
  expression?: string;

  options: { key: string; simple?: boolean; attr?: string };
}

/**
 * 页面选择器
 */
export interface PageLocator extends IStep {
  name: string;
  type: StepType;

  selector: Selector;

  expression?: string;
}

/**
 * 保存文本
 */
export interface TextSave extends IStep {
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
}

export interface TextSaveClose extends IStep {
  name: string;

  type: StepType;

  expression?: string;
}
