import { Injectable } from '@nestjs/common';
import {
  CheckElementExist,
  IStep,
  resultError,
  resultSuccess,
  RunContext,
  StepAction,
  StepResult,
  StepType,
} from '@easy-wt/common';
import { Page } from 'playwright';
import { getLocator, screenshotPath } from './../utils';

@Injectable()
export class CheckElementExistAction implements StepAction<CheckElementExist> {
  async run(
    step: CheckElementExist,
    context: RunContext
  ): Promise<StepResult<CheckElementExist>> {
    const { selector } = step;
    const options = step.options!;
    const { alwaysScreenshot, timeout, element, exist, failedContinue } =
      options;
    const page = context.page as Page;
    const imagesPath = await screenshotPath(context);
    const _options = Object.assign({}, options, { path: imagesPath });
    const locator = getLocator(selector, context);
    let count = await locator.count();
    if (!count) {
      try {
        await locator.waitFor({ timeout });
        count = await locator.count();
      } catch (e) {
        //
      }
    }
    if ((exist && count) || (!exist && !count)) {
      if (alwaysScreenshot) {
        if (element) {
          await locator.screenshot(_options);
        } else {
          await page.screenshot(_options);
        }
        return resultSuccess(true, step, { screenshot: imagesPath });
      }
      return resultSuccess(true, step);
    }
    await page.screenshot(_options);
    return resultError(failedContinue || false, step, {
      screenshot: imagesPath,
    });
  }

  support(step: IStep): boolean {
    return step.type == StepType.CHECK_ELEMENT_EXIST;
  }
}
