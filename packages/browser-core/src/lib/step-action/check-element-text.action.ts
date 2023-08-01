import {Injectable} from '@nestjs/common';
import {
  CheckElementText,
  IStep,
  resultError,
  resultSuccess,
  RunContext,
  StepAction,
  StepResult,
  StepType,
} from '@easy-wt/common';
import {Page} from 'playwright';
import {getLocator, getText, screenshotPath} from '../utils';
import * as vm from 'vm';

/**
 * 检查元素文本是否匹配的步骤
 */
@Injectable()
export class CheckElementTextAction implements StepAction<CheckElementText> {
  async run(
    step: CheckElementText,
    context: RunContext
  ): Promise<StepResult<CheckElementText>> {
    const { selector, expression } = step;
    let options = step.options;
    const { alwaysScreenshot, pattern, element, timeout, failedContinue } =
      options;
    const page = context.page as Page;
    let message = '';
    const imagePath = await screenshotPath(context);
    options = Object.assign({}, options, { path: imagePath });
    const locator = getLocator(selector, context);

    const text = await getText(locator, { timeout });
    const value = text || '';
    let checkResult;
    switch (pattern) {
      case 'EXP':
        checkResult = vm.runInNewContext(expression, { value: value });
        break;
      case 'STARTS_WITH':
        checkResult = value.startsWith(expression);
        break;
      case 'ENDS_WITH':
        checkResult = value.endsWith(expression);
        break;
      case 'CONTAINS':
        checkResult = value.indexOf(expression) >= 0;
        break;
      case 'NOT_CONTAINS':
        checkResult = value.indexOf(expression) < 0;
        break;
      case 'LE':
        checkResult = expression <= value;
        break;
      case 'LT':
        checkResult = expression < value;
        break;
      case 'GT':
        checkResult = expression > value;
        break;
      case 'GE':
        checkResult = expression >= value;
        break;
      case 'NOT_EQUALS':
        checkResult = expression !== value;
        break;
      case 'EQUALS':
      default:
        checkResult = expression == value;
        break;
    }
    if (checkResult) {
      if (alwaysScreenshot) {
        if (element) {
          await locator.screenshot(options);
        } else {
          await page.screenshot(options);
        }
        return Promise.resolve(
          resultSuccess(true, step, { screenshot: imagePath })
        );
      }
      return Promise.resolve(resultSuccess(true, step));
    }
    message = `检查内容不符合,存在内容:${value}`;
    const count = await locator.count();
    if (count === 1) {
      await locator.screenshot(options);
    } else {
      await page.screenshot(options);
    }
    return resultError(failedContinue || false, step, {
      screenshot: imagePath,
      message,
    });
  }

  support(step: IStep): boolean {
    return step.type == StepType.CHECK_ELEMENT_TEXT;
  }
}
