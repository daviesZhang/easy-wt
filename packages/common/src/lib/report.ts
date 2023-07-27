import { ActionResult } from './common';
import { IStep } from './step';

/**
 * 报告类
 */
export interface Report {
  id?: number;

  /**
   * 一个用例单次运行,根据不同浏览器可能产生多分报告,但是uuid相同
   *
   */
  uuid?: string;

  /**
   * 用例运行的次数,当用例开启失败重试时,计数
   */
  runCount: number;

  caseId: number;

  success: boolean;

  beginTime: number;

  endTime: number;

  totalCheck: number;

  successCount: number;

  outputPath?: string;

  casePath?: string;

  name?: string;

  browserType: string;

  actions: Array<ActionResult<IStep>>;
}

/**
 * 结果统计
 */
export interface StatReport {
  totalCheck: number;
  totalSuccessCheck: number;
  success: number;
  count: number;
}
