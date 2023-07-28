import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CoreService } from '../../../core/core.service';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, from, fromEventPattern, map, Observable } from 'rxjs';
import { GridOptions } from 'ag-grid-community';
import { GridTableComponent, RequestData } from '@easy-wt/ui-shared';
import { Report } from '@easy-wt/common';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'easy-wt-report-page',
  templateUrl: './report-page.component.html',
  styleUrls: ['./report-page.component.less'],
})
export class ReportPageComponent {
  report: Report | null = null;

  options: GridOptions;

  getData: RequestData<any, any>;

  table!: GridTableComponent;

  @ViewChild('rowButtonTemplate', { static: true })
  rowButtonTemplate!: TemplateRef<NzSafeAny>;

  report$: Observable<Report>;

  exportHTML = this.exportAsHTML.bind(this);
  exportPDF = this.exportAsPDF.bind(this);

  windowName: string;

  isRemoteServer = false;

  constructor(
    private coreService: CoreService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private message: NzMessageService
  ) {
    const id = this.route.snapshot.queryParams['id'];
    this.isRemoteServer = this.coreService.remoteServer();
    this.windowName = this.coreService.electron() ? `report-page-${id}` : null;
    if (this.isRemoteServer) {
      this.report$ = from(this.coreService.findReportById(id)).pipe(
        map((report) => {
          const host = new URL(document.URL).host;
          const id = report.outputPath;
          report.actions.forEach((action) => {
            if (action.data && action.data.screenshot) {
              action.data.screenshot = `//${host}${environment.api}/report/images/${id}/${action.data.screenshot}`;
            }
            if (action.data && action.data.video) {
              action.data.video = `//${host}${environment.api}/report/videos/${id}/${action.data.video}`;
            }
          });
          this.report = report;
          return report;
        })
      );
    } else {
      this.report$ = from(this.electronReportData());
    }
  }

  electronReportData() {
    return firstValueFrom(
      fromEventPattern(
        (handler) => {
          window.electron.onEvent('reportData', handler);
        },
        (handler) => {
          window.electron.offEvent('reportData', handler);
        }
      ).pipe(
        map(([, data]) => {
          const report = data[0] as Report;
          this.report = report;
          return report;
        })
      )
    );
  }

  electronExport(type: 'pdf' | 'html') {
    const id = this.report.id;
    window.electron.sendMessage('main', 'export-report', type, id);
    return new Promise<string>((resolve, reject) => {
      window.electron.onEvent(`export-report-${type}-${id}`, (event, data) => {
        const [file] = data;
        resolve(file as string);
      });
    });
  }

  async exportAsPDF() {
    const loading = this.message.loading(
      this.translate.instant('report.exporting', { type: 'PDF' }),
      { nzDuration: 0 }
    );
    let filePath;
    if (this.isRemoteServer) {
      filePath = await this.coreService.exportReportPDF(this.report.id);
    } else {
      filePath = await this.electronExport('pdf');
    }
    this.message.remove(loading.messageId);
    filePath &&
      this.message.success(
        `${filePath} ${this.translate.instant('report.export_complete')}`
      );
  }

  async exportAsHTML() {
    const loading = this.message.loading(
      this.translate.instant('report.exporting', { type: 'HTML' }),
      { nzDuration: 0 }
    );
    let filePath;
    if (this.isRemoteServer) {
      filePath = await this.coreService.exportReportHTML(this.report.id);
    } else {
      filePath = await this.electronExport('html');
    }
    this.message.remove(loading.messageId);
    filePath &&
      this.message.success(
        `${filePath} ${this.translate.instant('report.export_complete')}`
      );
  }
}
