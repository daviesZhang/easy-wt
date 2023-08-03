import { Injectable } from '@angular/core';

import {
  CaseEvent,
  ISchedule,
  IScriptCase,
  IStep,
  QueryParams,
  Report,
  RunConfig,
  StatReport,
} from '@easy-wt/common';
import { CoreService } from './core.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { filter, lastValueFrom, map, Observable } from 'rxjs';
import { SocketService } from './socket.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: 'root',
})
export class RemoteCoreService extends CoreService {
  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private ws: SocketService,
    private message: NzMessageService
  ) {
    super();
  }

  eventObservable<T>(eventName: CaseEvent): Observable<T> {
    return this.ws.initOrGetMessage().pipe(
      filter((message) => message.event === eventName),
      map((message) => message.data as T)
    );
  }

  openReportPage(id: number) {
    const href = location.href.replace(/#.*$/, '');
    window.open(`${href}#report?id=${id}`, '_blank');
    return Promise.resolve();
  }

  deleteCase(id: number): Promise<number[]> {
    return lastValueFrom(this.http.delete<number[]>(`/case/${id}`));
  }

  deleteStep(id: Array<number>): Promise<string> {
    return lastValueFrom(
      this.http.delete<string>(`/step/id?id=${id.join(',')}`)
    );
  }

  findAncestorsTree(id: number): Promise<IScriptCase> {
    return lastValueFrom(
      this.http.get<IScriptCase>(`/case/ancestor/tree/${id}`)
    );
  }

  findCaseByTree(): Promise<IScriptCase[]> {
    return lastValueFrom(this.http.get<IScriptCase[]>('/case/tree'));
  }

  findCasesById(id: number): Promise<IScriptCase[]> {
    return lastValueFrom(this.http.get<IScriptCase[]>(`/case/list/${id}`));
  }

  findStepByCaseId(caseId: number): Promise<IStep[]> {
    return lastValueFrom(this.http.get<IStep[]>(`/step/case/${caseId}`));
  }

  saveCase(item: IScriptCase): Promise<IScriptCase> {
    return lastValueFrom(this.http.post<IScriptCase>(`/case`, item));
  }

  saveStep(item: IStep[], sort?: boolean): Promise<IStep[]> {
    return lastValueFrom(this.http.post<IStep[]>(`/step`, { item, sort }));
  }

  updateStep(id: number, item: Partial<IStep>): Promise<string> {
    return lastValueFrom(this.http.put<string>(`/step`, { id, step: item }));
  }

  findCaseById(id: number): Promise<IScriptCase> {
    return lastValueFrom(
      this.http.get<IScriptCase>(`/case`, { params: { id } })
    );
  }

  findReportPage(query: QueryParams): Promise<[Report[], StatReport]> {
    return lastValueFrom(
      this.http.post<[Report[], StatReport]>(`/report/page`, query)
    );
  }

  findReportById(reportId: number): Promise<Report> {
    return lastValueFrom(this.http.get<Report>(`/report?id=${reportId}`));
  }

  exportReportHTML(id: number): Promise<string> {
    const contentType = 'application/zip';
    return new Promise((resolve, reject) => {
      this.http
        .get(`/report/html/${id}?lang=${this.translate.currentLang}`, {
          responseType: 'blob',
          headers: new HttpHeaders().append('Content-Type', contentType),
        })
        .subscribe({
          next: (resp) => {
            // resp: 文件流
            this.downloadFile(
              resp,
              this.translate.instant('report.name_file') + '.zip',
              contentType
            );
            resolve('');
            this.message.success(
              this.translate.instant('report.download_ready_tip'),
              { nzDuration: 3000 }
            );
          },
          error: (err) => reject(err),
        });
    });
  }

  exportReportPDF(id: number): Promise<string> {
    const contentType = 'application/pdf';
    return new Promise((resolve, reject) => {
      this.http
        .get(`/report/pdf/${id}`, {
          params: { lang: this.translate.currentLang },
          responseType: 'blob',
          headers: new HttpHeaders().append('Content-Type', contentType),
        })
        .subscribe({
          next: (resp) => {
            // resp: 文件流
            this.downloadFile(
              resp,
              this.translate.instant('report.name_file') + '.pdf',
              contentType
            );
            resolve('');
            this.message.success(
              this.translate.instant('report.download_ready_tip'),
              { nzDuration: 3000 }
            );
          },
          error: (err) => reject(err),
        });
    });
  }

  downloadFile(data: Blob, name: string, contentType: string) {
    const blob = new Blob([data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  remoteServer() {
    return true;
  }

  executeCase(caseId: number[], config: Partial<RunConfig>): Promise<void> {
    return lastValueFrom(
      this.http.post<void>(`/case/execute`, { caseId, config })
    );
  }

  findDescendantsById(id: number): Promise<IScriptCase[]> {
    return lastValueFrom(
      this.http.get<IScriptCase[]>(`/case/descendant/${id}`)
    );
  }

  findRoots(): Promise<IScriptCase[]> {
    return lastValueFrom(this.http.get<IScriptCase[]>('/case/root'));
  }

  copyCase(caseId: number): Promise<IScriptCase> {
    return lastValueFrom(
      this.http.post<IScriptCase>(`/case/copy/${caseId}`, null)
    );
  }

  deleteReport(id: number[]): Promise<void> {
    return lastValueFrom(
      this.http.delete<void>(`/report/id?id=${id.join(',')}`)
    );
  }

  deleteSchedule(scheduleId: number[]): Promise<void> {
    return lastValueFrom(
      this.http.delete<void>(`/schedule/id?id=${scheduleId.join(',')}`)
    );
  }

  findSchedulePage(query: QueryParams): Promise<[ISchedule[], number]> {
    return lastValueFrom(
      this.http.post<[ISchedule[], number]>(`/schedule/page`, query)
    );
  }

  scheduleExecuteCase(params: {
    caseId: number;
    cron: string;
    enable?: boolean;
  }): Promise<void> {
    return lastValueFrom(
      this.http.post<void>(`/schedule/execute/case`, params)
    );
  }

  saveAndCreate(schedules: Partial<ISchedule>[]): Promise<void> {
    return lastValueFrom(this.http.post<void>(`/schedule`, schedules));
  }

  getCronNextDate(cron: string): Promise<number | null> {
    return lastValueFrom(
      this.http.get<number | null>(`/schedule/next?cron=${cron}`)
    );
  }

  async openLogConsole() {
    //
  }
}
