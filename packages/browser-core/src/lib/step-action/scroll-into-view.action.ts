import { Injectable } from '@nestjs/common';
import {
  Hover,
  IStep,
  resultSuccess,
  RunContext,
  ScrollIntoView,
  StepAction,
  StepResult,
  StepType,
} from '@easy-wt/common';
import { getLocator } from '../utils';

@Injectable()
export class ScrollIntoViewAction implements StepAction<ScrollIntoView> {
  async run(
    step: Hover,
    context: RunContext
  ): Promise<StepResult<ScrollIntoView>> {
    const { selector, options } = step;
    const target = getLocator(selector, context);
    await target.scrollIntoViewIfNeeded(options);
    return resultSuccess(true, step);
  }

  support(step: IStep): boolean {
    return step.type === StepType.SCROLL_INTO_VIEW;
  }
}
