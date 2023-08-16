import { Injectable } from '@nestjs/common';
import {
  Hover,
  IStep,
  resultSuccess,
  RunContext,
  StepAction,
  StepResult,
  StepType,
} from '@easy-wt/common';
import { getLocator } from '../utils';
import isPlainObject from 'lodash/isPlainObject';

@Injectable()
export class HoverAction implements StepAction<Hover> {
  async run(step: Hover, context: RunContext): Promise<StepResult<Hover>> {
    const { selector, options } = step;
    const target = getLocator(selector, context);
    if (options) {
      if (
        !options.position ||
        !isPlainObject(options.position) ||
        Object.keys(options.position).length !== 2
      ) {
        delete options.position;
      }
    }
    await target.hover(options);

    return resultSuccess(true, step);
  }

  support(step: IStep): boolean {
    return step.type === StepType.HOVER;
  }
}
