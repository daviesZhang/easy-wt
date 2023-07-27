import { Inject, Injectable, Logger } from '@nestjs/common';
import { ReportService, ScriptCaseService } from '@easy-wt/database-core';

import {
  catchError,
  concatMap,
  defer,
  from,
  lastValueFrom,
  map,
  mergeMap,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
  throwError,
  toArray,
} from 'rxjs';
import {
  CaseError,
  CaseEvent,
  CaseQueue,
  ENVIRONMENT_CONFIG_TOKEN,
  EnvironmentConfig,
  IScriptCase,
  margeRunConfig,
  Report,
  RunConfig,
  RunContext,
  StepInterceptor,
  SupportBrowserType,
} from '@easy-wt/common';
import { CaseRunService, getNanoId } from '@easy-wt/browser-core';
import { EventEmitter } from 'events';
import { NoticeStepInterceptor } from '../interceptor/notice-step.interceptor';
import { DelayStepInterceptor } from '../interceptor/delay-step.interceptor';

@Injectable()
export class CasePoolService {
  eventEmitter = new EventEmitter();

  private runCase$ = new Subject<Observable<CaseQueue>>();

  logger = new Logger();

  constructor(
    private scriptCaseService: ScriptCaseService,
    private runService: CaseRunService,
    @Inject(ENVIRONMENT_CONFIG_TOKEN) private envConfig: EnvironmentConfig,
    private reportService: ReportService
  ) {
    const concurrent = envConfig.concurrent || 3;
    this.runCase$
      .pipe(
        mergeMap((next) => next, concurrent),
        catchError((taskError: CaseError) => of(taskError))
      )
      .subscribe((result) => {
        this.eventEmitter.emit(CaseEvent.CASE_QUEUE_REMOVE, {
          uuid: result.uuid,
          scriptCase: result.scriptCase,
        });
      });
  }

  /**
   * 把任务加入执行队列
   * @param caseId
   * @param config
   */
  async executeCase(
    caseId: Array<number> | number,
    config: Partial<RunConfig> = {}
  ) {
    if (!Array.isArray(caseId)) {
      caseId = [caseId];
    }
    for (const id of caseId) {
      const foundCase = await this.scriptCaseService.findById(id);
      if (!foundCase) {
        return Promise.reject({ message: '用例不存在~' });
      }
      let cases = [foundCase];
      if (foundCase.directory) {
        const caseList = await this.scriptCaseService.findCasesById(id);
        const list = caseList.filter((item) => item.steps && item.steps.length);
        if (!list.length) {
          return Promise.reject({ message: '用例步骤未完善,不可执行用例~' });
        }
        cases = list;
      }
      for (let scriptCase of cases) {
        scriptCase = await this.scriptCaseService.findAncestorsTree(
          scriptCase.id
        );
        scriptCase.steps = scriptCase.steps
          .filter((step) => step.enable)
          .sort((a, b) => (a.sort || 0) - (b.sort || 0));
        const uuid = await getNanoId(); //本次运行的id
        const action = defer(async () => {
          config.uuid = uuid;
          const report = await lastValueFrom(
            this.runCase(scriptCase, config).pipe(toArray())
          );
          try {
            await this.reportService.save(report);
            return { uuid, scriptCase };
          } catch (err) {
            this.logger.error(`保存用例报告时出现异常[${err.message}]~`);
            return Promise.reject(new CaseError(err, uuid, scriptCase));
          }
        });
        this.runCase$.next(action);
        this.eventEmitter.emit(CaseEvent.CASE_QUEUE_ADD, { uuid, scriptCase });
      }
    }
  }

  /**
   * 运行测试用例
   * @param scriptCase 用例
   * @param config 临时附加的配置
   */
  private runCase(
    scriptCase: IScriptCase,
    config: Partial<RunConfig>
  ): Observable<Report> {
    let browsers = config.browserType;
    if (!browsers || !browsers.length) {
      browsers = this.findBrowsers(scriptCase);
    }
    if (!browsers || !browsers.length) {
      return throwError(() => new Error('请至少指定一个要运行的浏览器~'));
    }
    return from(browsers).pipe(
      concatMap((type) => {
        return from(getNanoId()).pipe(
          map((id) =>
            this.createContext(scriptCase, type, id, {
              runConfig: config,
              interceptors: [new NoticeStepInterceptor(this.eventEmitter)],
            })
          ),
          switchMap((context) =>
            this.runService.runAndReport(context).pipe(
              tap({
                next: (report) =>
                  this.eventEmitter.emit(CaseEvent.CASE_END, report),
                error: (error) =>
                  this.eventEmitter.emit(
                    CaseEvent.CASE_ERROR,
                    new CaseError(error, config.uuid, scriptCase)
                  ),
              })
            )
          )
        );
      })
    );
  }

  private treeForEach(data: IScriptCase, func: (item: IScriptCase) => void) {
    func(data);
    if (data.parent) {
      this.treeForEach(data.parent, func);
    }
  }

  private getCasePath(scriptCase: IScriptCase): Array<string> {
    const casePath = [];
    this.treeForEach(scriptCase, (item) => casePath.push(item.name));
    return casePath.reverse();
  }

  private createContext(
    scriptCase: IScriptCase,
    browserType: SupportBrowserType,
    nanoId: string,
    extOptions?: {
      runConfig?: Partial<RunConfig>;
      interceptors?: StepInterceptor[];
    }
  ) {
    let { runConfig, interceptors } = extOptions;
    runConfig = margeRunConfig(scriptCase, runConfig);
    // 获取用例配置数据,从用例树从下往上找,下层的配置具有优先级
    const casePath = this.getCasePath(scriptCase);
    const runParams = new Map<string, unknown>();
    if (runConfig.runParams) {
      Object.keys(runConfig.runParams).forEach((key) => {
        runParams.set(key, runConfig.runParams[key]);
      });
    }
    /**
     * 如果启用了步骤延迟,加入步骤延迟逻辑的拦截器
     */
    interceptors = interceptors || [];
    if (runConfig.delay) {
      interceptors.push(new DelayStepInterceptor(runConfig.delay));
    }
    return new RunContext({
      runConfig,
      runParams,
      uuid: nanoId,
      scriptCase,
      browserType: browserType,
      environmentConfig: this.envConfig,
      interceptors: interceptors,
      casePath,
    });
  }

  private findBrowsers(scriptCase: IScriptCase): Array<SupportBrowserType> {
    if (
      scriptCase.runConfig.browserType &&
      scriptCase.runConfig.browserType.length
    ) {
      return scriptCase.runConfig.browserType;
    }
    if (!scriptCase.parent) {
      return null;
    }
    return this.findBrowsers(scriptCase.parent);
  }
}
