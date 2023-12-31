import { BrowserContext, Page } from 'playwright';
import { lastValueFrom, take, timer } from 'rxjs';
import * as vm from 'vm';
import { Injectable, Logger } from '@nestjs/common';

import {
  ClickElement,
  ClickLink,
  CloseBrowser,
  InputText,
  IStep,
  Keyboard,
  Mouse,
  OpenPage,
  PageLocator,
  PutParams,
  resultError,
  resultSuccess,
  RunContext,
  RunScript,
  Screenshot,
  SelectPage,
  StepAction,
  StepResult,
  StepType,
  StructElse,
  StructEndIf,
  StructEndwhile,
  StructIf,
  StructWhile,
  Wait,
} from '@easy-wt/common';
import {
  convertNumber,
  getLocator,
  getPage,
  getText,
  screenshotPath,
} from './../utils';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class OpenPageAction implements StepAction<OpenPage> {
  async run(
    step: OpenPage,
    context: RunContext
  ): Promise<StepResult<OpenPage>> {
    const browser = context.browser as BrowserContext;
    const { timeout, defaultTimeout } = step.options || {};

    const page = await browser.newPage();
    const _defaultTimeout = convertNumber(defaultTimeout);
    if (_defaultTimeout) {
      page.setDefaultTimeout(_defaultTimeout);
    }
    context.page = page;
    await page.goto(step.expression, { timeout });
    const video = page.video();
    if (video) {
      const path = await video.path();
      return resultSuccess(true, step, { video: path });
    }
    return resultSuccess(true, step, {});
  }

  support(step: OpenPage): boolean {
    return step.type === StepType.OPEN_PAGE;
  }
}

@Injectable()
export class KeyboardAction implements StepAction<Keyboard> {
  async run(
    step: Keyboard,
    context: RunContext
  ): Promise<StepResult<Keyboard>> {
    const page = context.page as Page;
    const { expression } = step;
    const options = step.options!;
    const { type, ...other } = options;
    let action: Promise<void>;
    switch (type) {
      case 'type':
        action = page.keyboard.type(expression, other || {});
        break;
      case 'press':
        action = page.keyboard.press(expression, other || {});
        break;
      case 'up':
        action = page.keyboard.up(expression);
        break;
      case 'down':
      default:
        action = page.keyboard.down(expression);
        break;
    }
    await action;
    return resultSuccess(true, step);
  }

  support(step: IStep): boolean {
    return step.type === StepType.KEYBOARD;
  }
}

@Injectable()
export class MouseAction implements StepAction<Mouse> {
  async run(step: Mouse, context: RunContext): Promise<StepResult<Mouse>> {
    const options = step.options!;
    const { type, x, y, mouseButton, ...other } = options;

    switch (type) {
      case 'down':
      case 'up':
        await getPage(context).mouse[type]({ button: mouseButton, ...other });
        break;
      case 'dblclick':
      case 'click':
        await getPage(context).mouse[type](x!, y!, {
          button: mouseButton,
          ...other,
        });
        break;
      case 'wheel':
      case 'move':
        await getPage(context).mouse[type](x!, y!, { ...other });
        break;
    }
    return resultSuccess(true, step);
  }

  support(step: IStep): boolean {
    return step.type === StepType.MOUSE;
  }
}

@Injectable()
export class CloseBrowserAction implements StepAction<CloseBrowser> {
  async run(
    step: CloseBrowser,
    context: RunContext
  ): Promise<StepResult<CloseBrowser>> {
    if (context.browser) {
      const browserContext = context.browser as BrowserContext;
      const browser = browserContext.browser();
      await browserContext.close();
      if (browser) {
        await browser.close();
      }
    }
    return resultSuccess(true, step);
  }

  support(step: CloseBrowser): boolean {
    return step.type === StepType.CLOSE_BROWSER;
  }
}

@Injectable()
export class InputTextAction implements StepAction<InputText> {
  async run(
    step: InputText,
    context: RunContext
  ): Promise<StepResult<InputText>> {
    const selector = step.selector;
    const options = step.options;

    await getLocator(selector, context).fill(
      step.expression,
      Object.assign({}, options)
    );
    return resultSuccess(true, step);
  }

  support(step: InputText): boolean {
    return step.type === StepType.INPUT_TEXT;
  }
}

@Injectable()
export class ClickLinkAction implements StepAction<ClickLink> {
  async run(
    step: ClickLink,
    context: RunContext
  ): Promise<StepResult<ClickLink>> {
    const selector = step.selector;

    const options = step.options;
    const browser = context.browser as BrowserContext;
    const { timeout, switchPage } = options;
    const pagePromise = browser.waitForEvent('page', { timeout });
    await getLocator(selector, context).click({ timeout });
    const newPage = await pagePromise;
    if (switchPage) {
      context.page = newPage;
    }
    const video = newPage.video();
    if (video) {
      return resultSuccess(true, step, { video: await video.path() });
    }
    return resultSuccess(true, step);
  }

  support(step: ClickLink): boolean {
    return step.type === StepType.CLICK_LINK;
  }
}

@Injectable()
export class ClickElementAction implements StepAction<ClickElement> {
  async run(
    step: ClickElement,
    context: RunContext
  ): Promise<StepResult<ClickElement>> {
    const selector = step.selector;

    const options = step.options;
    await getLocator(selector, context).click(options);
    return resultSuccess(true, step);
  }

  support(step: ClickElement): boolean {
    return step.type === StepType.CLICK_ELEMENT;
  }
}

/**
 * 截图步骤
 */
@Injectable()
export class ScreenshotAction implements StepAction<Screenshot> {
  async run(
    step: Screenshot,
    context: RunContext
  ): Promise<StepResult<Screenshot>> {
    const { selector } = step;
    const options = step.options;
    const imagePath = await screenshotPath(context);
    const customPath = options.path;
    const _options = Object.assign({}, options, { path: imagePath });
    if (selector) {
      await getLocator(selector, context).screenshot(_options);
    } else {
      await getPage(context).screenshot(_options);
    }
    if (customPath && customPath !== imagePath) {
      await fs.copy(imagePath, customPath);
    }
    return resultSuccess(true, step, { screenshot: imagePath });
  }

  support(step: Screenshot): boolean {
    return step.type === StepType.SCREENSHOT;
  }
}







/**
 * 设置变量,以便于后续步骤使用
 */
@Injectable()
export class PutParamsAction implements StepAction<PutParams> {
  async run(
    step: PutParams,
    context: RunContext
  ): Promise<StepResult<PutParams>> {
    const { selector, expression, options } = step;
    const { key, simple, attr } = options;
    const params = [];
    if (expression) {
      let _value;
      if (simple) {
        _value = expression;
      } else {
        _value = vm.runInNewContext(expression) as string;
      }
      context.runParams.set(key, _value);
      params.push(_value);
    }
    if (selector) {
      const locator = getLocator(selector!, context);
      let text;
      if (attr) {
        text = await locator.getAttribute(attr);
      } else {
        text = await getText(locator);
      }
      context.runParams.set(key, text);
      params.push(text);
    }
    return Promise.resolve(resultSuccess(true, step, { params }));
  }

  support(step: PutParams): boolean {
    return step.type === StepType.PUT_PARAMS;
  }
}

@Injectable()
export class PageLocatorAction implements StepAction<PageLocator> {
  run(
    step: PageLocator,
    context: RunContext
  ): Promise<StepResult<PageLocator>> {
    const { selector } = step;
    getLocator(selector, context);
    return Promise.resolve(resultSuccess(true, step, {}));
  }

  support(step: IStep): boolean {
    return step.type === StepType.PAGE_LOCATOR;
  }
}

@Injectable()
export class StructIfAction implements StepAction<StructIf> {
  async run(
    step: StructIf,
    context: RunContext
  ): Promise<StepResult<StructIf>> {
    const { selector, expression } = step;

    let selectorResult = true;
    let expressionResult = true;
    if (selector) {
      const count = await getLocator(selector, context).count();
      selectorResult = !!count;
    }
    if (expression) {
      expressionResult = !!vm.runInNewContext(expression, { context });
    }
    return resultSuccess(true, step, {
      success: expressionResult && selectorResult,
    });
  }

  support(step: StructIf): boolean {
    return step.type === StepType.STRUCT_IF;
  }
}

@Injectable()
export class StructElseAction implements StepAction<StructElse> {
  run(step: StructElse): Promise<StepResult<StructElse>> {
    return Promise.resolve(resultSuccess(true, step));
  }

  support(step: StructIf): boolean {
    return step.type === StepType.STRUCT_ELSE;
  }
}

@Injectable()
export class StructEndIfAction implements StepAction<StructEndIf> {
  run(
    step: StructEndIf,
    context: RunContext
  ): Promise<StepResult<StructEndIf>> {
    return Promise.resolve(resultSuccess(true, step));
  }

  support(step: StructIf): boolean {
    return step.type === StepType.STRUCT_ENDIF;
  }
}

@Injectable()
export class StructWhileAction implements StepAction<StructWhile> {
  private logger = new Logger('循环判断器');

  async run(
    step: StructWhile,
    context: RunContext
  ): Promise<StepResult<StructWhile>> {
    const { expression, selector } = step;
    let success = true;
    if (expression) {
      success = !!vm.runInNewContext(expression, {});
    }
    if (success && selector) {
      this.logger.debug(`尝试寻找选择器,${JSON.stringify(selector)}`);
      const count = await getLocator(selector, context).count();
      success = count > 0;
    }
    return resultSuccess(true, step, { next: success });
  }

  support(step: StructWhile): boolean {
    return step.type === StepType.STRUCT_WHILE;
  }
}

@Injectable()
export class StructEndwhileAction implements StepAction<StructEndwhile> {
  run(
    step: StructEndwhile,
    context: RunContext
  ): Promise<StepResult<StructEndwhile>> {
    return Promise.resolve(resultSuccess(true, step));
  }

  support(step: StructEndwhile): boolean {
    return step.type === StepType.STRUCT_ENDWHILE;
  }
}

export class SelectPageAction implements StepAction<SelectPage> {
  async run(
    step: SelectPage,
    context: RunContext
  ): Promise<StepResult<SelectPage>> {
    const browser = context.browser as BrowserContext;
    let pages = browser.pages();
    const { expression } = step;
    if (/^\d+$/.test(expression)) {
      const index = parseInt(expression, 10) - 1 || 1;
      if (pages.length > index) {
        context.page = pages[index];
      } else {
        return Promise.resolve(
          resultError(false, step, {
            message: `找不到要切换的页面,index:${index}~`,
          })
        );
      }
    } else {
      const regx = new RegExp(expression);
      pages = pages.filter((page) => regx.test(page.url()));
      if (pages.length) {
        const page = pages[0];
        context.page = page;
        await page.bringToFront();
      } else {
        return Promise.resolve(
          resultError(false, step, {
            message: `找不到要切换的页面,expression:${expression}`,
          })
        );
      }
    }
    return Promise.resolve(resultSuccess(true, step));
  }

  support(step: SelectPage): boolean {
    return step.type === StepType.SELECT_PAGE;
  }
}

@Injectable()
export class WaitAction implements StepAction<Wait> {
  async run(step: Wait, context: RunContext): Promise<StepResult<Wait>> {
    const { expression, selector } = step;
    const options = step.options;
    const promises = [];
    if (selector && Object.keys(selector).length) {
      promises.push(getLocator(selector, context).waitFor(options));
    }
    if (expression && /^\d+$/g.test(expression)) {
      const page = getPage(context);
      if (page) {
        promises.push(page.waitForTimeout(parseInt(expression)));
      } else {
        promises.push(lastValueFrom(timer(parseInt(expression)).pipe(take(1))));
      }
    }
    return Promise.all(promises).then(() => resultSuccess(true, step));
  }

  support(step: IStep): boolean {
    return step.type === StepType.WAIT;
  }
}

@Injectable()
export class RunScriptAction implements StepAction<RunScript> {
  run(step: RunScript, context: RunContext): Promise<StepResult<RunScript>> {
    const { expression } = step;
    const options = step.options;

    return vm.runInNewContext(
      expression,
      {
        step,
        options,
        context,
        fs,
        path,
      },
      { displayErrors: true }
    ) as Promise<StepResult<RunScript>>;
  }

  support(step: IStep): boolean {
    return step.type === StepType.RUN_SCRIPT;
  }
}
