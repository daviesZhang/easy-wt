import { Injectable } from '@nestjs/common';
import {
  IStep,
  resultSuccess,
  RunContext,
  StepAction,
  StepResult,
  StepType,
  TextSave,
  TextSaveClose,
} from '@easy-wt/common';
import { getLocator, getWriteStreamMap } from '../utils';

import * as fs from 'fs-extra';

@Injectable()
export class TextSaveAction implements StepAction<TextSave> {
  async run(
    step: TextSave,
    context: RunContext
  ): Promise<StepResult<TextSave>> {
    const { options, selector, expression } = step;
    const { filePath, attr, overwrite, autoClose } = options;
    const text: Array<string> = [];
    if (expression) {
      text.push(expression);
    }
    const locator = getLocator(selector, context);
    const count = await locator.count();
    if (count) {
      if (!attr) {
        text.push(...(await locator.allTextContents()));
      } else {
        const locators = await locator.all();
        for (const item of locators) {
          const attrValue = await item.getAttribute(attr);
          attrValue && text.push(attrValue);
        }
      }
    }
    if (!text.length) {
      //todo 如果没有根据选择器找到元素,那么怎么办,抛错还是跳过
      return resultSuccess(true, step, { message: 'step.error.text_empty' });
    }
    const flag = overwrite ? 'w' : 'a';
    const buffer = Buffer.from(text.join('\n\t'));
    if (autoClose) {
      await fs.writeFile(filePath, buffer, {
        encoding: 'utf-8',
        flag,
      });
    } else {
      const writeStreamMap = getWriteStreamMap(context, true);
      let writeStream: fs.WriteStream;
      if (writeStreamMap.has(filePath)) {
        writeStream = writeStreamMap.get(filePath)!;
      } else {
        writeStream = fs.createWriteStream(filePath, {
          flags: flag,
          encoding: 'utf-8',
        });
      }
      writeStream.write(buffer);
    }
    return resultSuccess(true, step, { data: { filePath } });
  }

  support(step: IStep): boolean {
    return step.type === StepType.TEXT_SAVE;
  }
}

@Injectable()
export class TextSaveCloseAction implements StepAction<TextSaveClose> {
  async run(
    step: TextSaveClose,
    context: RunContext
  ): Promise<StepResult<TextSaveClose>> {
    const { expression } = step;
    const map = getWriteStreamMap(context);
    if (!expression || !map || !map.has(expression)) {
      return resultSuccess(true, step);
    }
    const stream = map.get(expression);
    if (!stream || stream.closed) {
      return resultSuccess(true, step);
    }
    await new Promise((resolve, reject) => {
      stream.close(() => resolve(true));
    });
    return resultSuccess(true, step);
  }

  support(step: IStep): boolean {
    return step.type === StepType.TEXT_SAVE_CLOSE;
  }
}
