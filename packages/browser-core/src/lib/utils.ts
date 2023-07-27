import { RunContext } from '@easy-wt/common';
import * as path from 'path';
import * as fs from 'fs-extra';
import { devices } from 'playwright';
import { customAlphabet } from 'nanoid/async';

const nanoid = customAlphabet(
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

export const DAVIE_NAME_LIST = Object.keys(devices);
