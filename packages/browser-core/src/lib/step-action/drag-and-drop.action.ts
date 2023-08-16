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
import isPlainObject from 'lodash/isPlainObject';

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
    if (options) {
      if (
        !options.targetPosition ||
        !isPlainObject(options.targetPosition) ||
        Object.keys(options.targetPosition).length !== 2
      ) {
        delete options.targetPosition;
      }
      if (
        !options.sourcePosition ||
        !isPlainObject(options.sourcePosition) ||
        Object.keys(options.sourcePosition).length !== 2
      ) {
        delete options.sourcePosition;
      }
    }
    const target = getLocator(selector, context);
    await source.dragTo(target, options);
    return resultSuccess(true, step);
  }

  support(step: IStep): boolean {
    return step.type === StepType.DRAG_AND_DROP;
  }
}
