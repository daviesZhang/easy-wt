import { RunContext, Selector } from '@easy-wt/common';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Locator, Page } from 'playwright';
import { customAlphabet } from 'nanoid/async';
import { customAlphabet as customAlphabetSync } from 'nanoid';

export type locatorRole = Parameters<Page['getByRole']>[0];

const nanoid = customAlphabet(
  '_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  12
);

const nanoidSync = customAlphabetSync(
  '_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  12
);


/**
 * 确保路径存在
 * @param data 上下文,最终路径为环境变量中输出路径+uuid+dir.如果为最终路径,只确保文件存在
 * @param dir 扩展的路径
 */
export async function ensurePath(
  data: RunContext,
  dir: Array<string> = ['images']
): Promise<string> {
  const output = data.environmentConfig.output;
  const savePath = path.join(output, data.uuid, ...dir);
  const dirname = path.dirname(savePath);
  const pathExists = await fs.pathExists(dirname);
  if (!pathExists) {
    await fs.ensureDir(dirname);
  }
  return savePath;
}

export async function getNanoId() {
  return await nanoid();
}

export function getNanoIdSync() {
  return nanoidSync();
}

export function convertNumber(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    return parseInt(value.trim(), 10);
  }
  return undefined;
}
/**
 * 生成截屏存放的路径,如果不存在则创建
 * @param context 上下文内容
 */
export async function screenshotPath(context: RunContext): Promise<string> {
  const name: string = await getNanoId();
  return await ensurePath(context, ['images', `${name}.png`]);
}

export function getLocator(
  selector: string | Selector | null | undefined,
  context: RunContext
): Locator {
  const previous = context.locator as Locator;
  if (!selector || !Object.keys(selector).length) {
    if (previous) {
      return previous;
    }
    throw new Error('元素选择器为空,无法查找页面元素~');
  }
  const page = context.page as Page;
  if (typeof selector === 'string') {
    return page.locator(selector);
  }
  const { value, connect, nth, type, exact, filterValue, filter } = selector;
  let text: string | RegExp = value;
  let filterText: string | RegExp | undefined = filterValue;
  if (value.startsWith('/') && value.endsWith('/') && value.length > 2) {
    text = new RegExp(value.replace(/^\/|\/$/g, ''));
  }
  if (
    filterValue &&
    filterValue.startsWith('/') &&
    filterValue.endsWith('/') &&
    filterValue.length > 2
  ) {
    filterText = new RegExp(filterValue.replace(/^\/|\/$/g, ''));
  }
  let locator: Locator;
  switch (type) {
    case 'AltText':
      locator = page.getByAltText(text, { exact });
      break;
    case 'Placeholder':
      locator = page.getByPlaceholder(text, { exact });
      break;
    case 'Role':
      locator = page.getByRole(value as locatorRole, { exact });
      break;
    case 'Text':
      locator = page.getByText(text, { exact });
      break;
    case 'Label':
      locator = page.getByLabel(text, { exact });
      break;
    case 'Title':
      locator = page.getByTitle(text, { exact });
      break;
    case 'Css':
    case 'XPath':
    default:
      locator = page.locator(value);
      break;
  }
  if (filter && filterText) {
    switch (filter) {
      case 'hasText':
        locator = locator.filter({ hasText: filterText });
        break;
      case 'hasNotText':
        locator = locator.filter({ hasNotText: filterText });
    }
  }
  if (nth) {
    locator = locator.nth(nth);
  }
  if (previous && connect) {
    switch (connect) {
      case 'or':
        locator = previous.or(locator);
        break;
      case 'locator':
        locator = previous.locator(locator);
        break;
      case 'and':
      default:
        locator = previous.and(locator);
        break;
    }
  }
  context.locator = locator;
  return locator;
}

/**
 * 获取页面对象
 * @param context
 */
export function getPage(context: RunContext): Page {
  return context.page as Page;
}


/**
 * 获取定位器定位的元素文本,优先级先找content>input>innerText
 * @param locator
 * @param options
 */
export async function getText(
  locator: Locator,
  options?: { innerText?: boolean; timeout?: number }
): Promise<string> {
  const {innerText, timeout} = options || {};
  let text = await locator.textContent({timeout});
  if (!text) {
    text = await locator.inputValue();
  }
  if (!text && innerText) {
    text = await locator.innerText();
  }
  return text;
}
export function getWriteStreamMap(
  context: RunContext,
  create = false
): Map<string, fs.WriteStream> {
  if (!context['writeStreamMap'] && create) {
    context['writeStreamMap'] = new Map<string, fs.WriteStream>();
  }
  return context['writeStreamMap'] as Map<string, fs.WriteStream>;
}
