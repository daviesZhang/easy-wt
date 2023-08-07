import {
  event,
  ISchedule,
  IScriptCase,
  IStep,
  QueryParams,
  Report,
  RunConfig,
  StatReport,
} from '@easy-wt/common';
import { Observable } from 'rxjs';
import { NzModalRef } from 'ng-zorro-antd/modal/modal-ref';

export abstract class CoreService {
  abstract remoteServer();

  abstract createModal<T, R>(create: () => NzModalRef<T, R>): NzModalRef<T, R>;

  electron(): boolean {
    return !!window.electron;
  }

  /**
   * 打开日志显示工具
   */
  abstract openLogConsole(): Promise<void>;
  /**
   * 事件
   * @param eventName
   */
  abstract eventObservable<T>(eventName: event): Observable<T>;

  /**
   * 找到所有节点,返回树结构
   */
  abstract findCaseByTree(): Promise<IScriptCase[]>;

  /**
   * 根据用例ID找到用例数据,关联left join run config数据
   */
  abstract findCaseById(id: number): Promise<IScriptCase>;

  /**
   * 删除节点,以及他的子节点和对应用例数据
   * @param id
   */
  abstract deleteCase(id: number): Promise<number[]>;

  abstract deleteReport(id: number[]): Promise<void>;

  /**
   * 根据ID找到用例,并且找到他的所有上级,返回tree
   * @param id
   * @return Promise<IScriptCase> 向上树结构
   */
  abstract findAncestorsTree(id: number): Promise<IScriptCase>;

  /**
   * 拷贝用例或者目录
   * @param caseId
   */
  abstract copyCase(caseId: number): Promise<IScriptCase>;

  /**
   * 保存用例
   * @param item
   */
  abstract saveCase(item: Partial<IScriptCase>): Promise<IScriptCase>;

  abstract findRoots(): Promise<IScriptCase[]>;

  /**
   * 根据节点,找到对应用例列表,包含全部深度 ,left join config,steps
   * @param id 父级ID
   */
  abstract findCasesById(id: number): Promise<IScriptCase[]>;

  /**
   * 根据父级ID找到他的所有下级
   * @param id 父级ID
   * @param depth 深度
   * @return 返回列表
   */
  abstract findDescendantsById(id: number): Promise<IScriptCase[]>;

  /**
   * 保存用例步骤
   * @param item
   * @param sort 是否处理排序问题,如果false,不处理sort字段在,直接存入
   */
  abstract saveStep(item: IStep[], sort?: boolean): Promise<IStep[]>;

  abstract updateStep(id: number, item: Partial<IStep>): Promise<string>;

  abstract executeCase(
    caseId: Array<number>,
    config: Partial<RunConfig>
  ): Promise<void>;

  /**
   * 定时执行某个用例
   * @param params
   */
  abstract scheduleExecuteCase(params: {
    caseId: number;
    name: string;
    cron: string;
    enable?: boolean;
  }): Promise<void>;

  /**
   * 修改/新增 定时任务
   * @param schedules
   */
  abstract saveAndCreate(schedules: Partial<ISchedule>[]): Promise<void>;

  /**
   * 删除定时器
   * @param scheduleId
   */
  abstract deleteSchedule(scheduleId: number[]): Promise<void>;

  /**
   * 分页查询定时器
   * @param query
   */
  abstract findSchedulePage(query: QueryParams): Promise<[ISchedule[], number]>;

  abstract getCronNextDate(cron: string): Promise<number | null>;

  /**
   * 根据用例,找到所有步骤
   * @param caseId
   */
  abstract findStepByCaseId(caseId: number): Promise<IStep[]>;

  /**
   * 删除 用例的步骤
   * @param id
   */
  abstract deleteStep(id: Array<number>): Promise<string>;

  abstract findReportPage(query: QueryParams): Promise<[Report[], StatReport]>;

  abstract findReportById(reportId: number): Promise<Report>;

  abstract openReportPage(id: number): Promise<void>;

  abstract exportReportPDF(id: number): Promise<string>;

  abstract exportReportHTML(id: number): Promise<string>;
}
