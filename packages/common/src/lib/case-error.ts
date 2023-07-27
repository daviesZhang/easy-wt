import { IScriptCase } from './script-case';

export class CaseError implements Error {
  message: string;

  name: string;

  /**
   * 错误内容
   */
  error: Error;

  /**
   * 运行ID
   */
  uuid: string;

  scriptCase: IScriptCase;

  constructor(
    error: Error,
    uuid: string,
    scriptCase: IScriptCase,
    message?: string
  ) {
    this.error = error;
    this.scriptCase = scriptCase;
    this.message = message || error.message;
    this.uuid = uuid;
    this.name = '用例运行失败~';
  }
}
