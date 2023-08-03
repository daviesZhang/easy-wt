import { Injectable } from '@angular/core';

import {
  CaseEvent,
  CONSOLE_VIEW_NAME,
  ELECTRON_IPC_EVENT,
  ISchedule,
  IScriptCase,
  IStep,
  MAIN_WINDOW_NAME,
  QueryParams,
  Report,
  RunConfig,
  StatReport,
} from '@easy-wt/common';
import { CoreService } from './core.service';
import { fromEventPattern, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd/modal';

@Injectable({
  providedIn: 'root',
})
export class ElectronCoreService extends CoreService {
  constructor(
    private translate: TranslateService,

    private modalService: NzModalService
  ) {
    super();
  }

  async openLogConsole() {
    const url = await window.electron.getMainLoadURL();
    await window.electron.invokeEvent(
      ELECTRON_IPC_EVENT.TOGGLE_BROWSER_VIEW,
      MAIN_WINDOW_NAME,
      CONSOLE_VIEW_NAME,
      `${url}#console?startService=false`,
      300
    );
  }

  findCaseById(id: number): Promise<IScriptCase> {
    return window.scriptCaseService.findById(id);
  }

  /**
   * 返回全部目录树
   */
  findCaseByTree(): Promise<IScriptCase[]> {
    return window.scriptCaseService.findTrees();
  }

  /**
   * 保存节点
   * @param item
   */
  saveCase(item: Partial<IScriptCase>): Promise<IScriptCase> {
    return window.scriptCaseService.save(item);
  }

  deleteStep(id: Array<number>): Promise<string> {
    return window.stepService.delete(id);
  }

  findStepByCaseId(caseId: number): Promise<IStep[]> {
    return window.stepService.findByCaseId(caseId);
  }

  saveStep(item: IStep[], sort?: boolean): Promise<IStep[]> {
    return window.stepService.save(item, sort);
  }

  async executeCase(
    caseId: Array<number>,
    config: Partial<RunConfig>
  ): Promise<void> {
    await window.browserCore.executeCase(caseId, config);
  }

  findAncestorsTree(id: number): Promise<IScriptCase> {
    return window.scriptCaseService.findAncestorsTree(id);
  }

  eventObservable<T>(eventName: CaseEvent): Observable<T> {
    return fromEventPattern<T>(
      (handler) => {
        window.browserCore.onEvent(eventName, handler);
        return eventName;
      },
      (handler, signal) => {
        window.browserCore.onEvent(signal, handler);
      }
    );
  }

  deleteCase(id: number): Promise<number[]> {
    return window.scriptCaseService.delete(id);
  }

  findCasesById(id: number): Promise<IScriptCase[]> {
    return window.scriptCaseService.findCasesById(id);
  }

  findDescendantsById(id: number): Promise<IScriptCase[]> {
    return window.scriptCaseService.findDescendantsById(id);
  }

  updateStep(id: number, item: Partial<IStep>): Promise<string> {
    return window.stepService.update(id, item);
  }

  findReportPage(query: QueryParams): Promise<[Report[], StatReport]> {
    return window.reportService.findPage(query);
  }

  findReportById(reportId: number): Promise<Report> {
    return window.reportService.findById(reportId);
  }

  async exportReportHTML(id: number): Promise<string> {
    let filePath = await window.electron.showSaveDialog({
      title: this.translate.instant('report.dialog_title', { type: 'HTML' }),
      properties: ['createDirectory'],
    });
    if (!filePath) {
      return null;
    }
    if (!filePath.endsWith('.zip')) {
      filePath = `${filePath}.zip`;
    }
    const report = await this.findReportById(id);
    await window.browserCore.exportHTML(
      report,
      filePath,
      this.translate.currentLang
    );
    return filePath;
  }

  async exportReportPDF(id: number): Promise<string> {
    let filePath: string = await window.electron.showSaveDialog({
      title: this.translate.instant('report.dialog_title', { type: 'PDF' }),
      properties: ['createDirectory'],
    });
    if (!filePath) {
      return null;
    }
    if (!filePath.endsWith('.pdf')) {
      filePath = `${filePath}.pdf`;
    }
    const report = await this.findReportById(id);
    await window.browserCore.exportPDF(
      report,
      filePath,
      this.translate.currentLang
    );
    return filePath;
  }

  async openReportPage(id: number): Promise<void> {
    const url = await window.electron.getMainLoadURL();
    const windowName = `report-page-${id}`;
    await window.electron.newWindow(
      `report-page-${id}`,
      `${url}#report?id=${id}&startService=false`,
      false,
      { modal: false, frame: false, width: 800, height: 1000 }
    );
    const report = await this.findReportById(id);
    window.electron.sendMessage(windowName, 'reportData', report);
  }

  remoteServer() {
    return false;
  }

  findRoots(): Promise<IScriptCase[]> {
    return window.scriptCaseService.findRoots();
  }

  copyCase(caseId: number): Promise<IScriptCase> {
    return window.scriptCaseService.copyCase(caseId);
  }

  deleteReport(id: number[]): Promise<void> {
    return window.reportService.delete(id);
  }

  scheduleExecuteCase(params: {
    caseId: number;
    name: string;
    cron: string;
    enable?: boolean;
  }): Promise<void> {
    return window.scheduleService.scheduleExecuteCase(params);
  }

  deleteSchedule(scheduleId: number[]): Promise<void> {
    return window.scheduleService.deleteSchedule(scheduleId);
  }

  findSchedulePage(query: QueryParams): Promise<[ISchedule[], number]> {
    return window.scheduleService.findPage(query);
  }

  saveAndCreate(schedules: Partial<ISchedule>[]): Promise<void> {
    return window.scheduleService.saveAndCreate(schedules);
  }

  getCronNextDate(cron: string): Promise<number | null> {
    return window.scheduleService.getCronNextDate(cron);
  }

  init() {
    window.electron.onLogEvent((message) => {
      window.electron.sendMessage(CONSOLE_VIEW_NAME, 'log_event', message);
    });
    window.electron.onMainEvent('export-report', async (event, data) => {
      const [type, id] = data;
      let file: string;
      if (type === 'pdf') {
        file = await this.exportReportPDF(id);
      } else {
        file = await this.exportReportHTML(id);
      }
      window.electron.sendMessage(
        `report-page-${id}`,
        `export-report-${type}-${id}`,
        file
      );
    });
  }
}
