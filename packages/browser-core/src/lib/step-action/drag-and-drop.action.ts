import { Injectable } from '@nestjs/common';
import {
  DragAndDrop,
  IStep,
  resultError,
  resultSuccess,
  RunContext,
  StepAction,
  StepResult,
  StepType,
} from '@easy-wt/common';
import { getLocator } from '../utils';

import { Locator } from 'playwright';

@Injectable()
export class DragAndDropAction implements StepAction<DragAndDrop> {
  async run(
    step: DragAndDrop,
    context: RunContext
  ): Promise<StepResult<DragAndDrop>> {
    const source = context.locator as Locator;
    if (!source) {
      return resultError(false, step, {
        message: 'step.error.drag_and_drop_source_empty',
      });
    }
    const { selector, options } = step;
    const target = getLocator(selector, context);
    await source.dragTo(target, options);
    return resultSuccess(true, step);
  }

  support(step: IStep): boolean {
    return step.type === StepType.DRAG_AND_DROP;
  }
}
