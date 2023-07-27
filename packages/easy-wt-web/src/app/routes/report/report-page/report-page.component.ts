import { Component, Inject, TemplateRef, ViewChild } from '@angular/core';
import { CoreService } from '../../../core/core.service';
import { ActivatedRoute } from '@angular/router';
import { from, Observable, tap } from 'rxjs';
import { GridOptions } from 'ag-grid-community';
import { GridTableComponent, RequestData } from '@easy-wt/ui-shared';
import { Report } from '@easy-wt/common';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DOCUMENT } from '@angular/common';
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

  exportHTML: () => void;
  exportPDF: () => void;

  windowName: string;

  constructor(
    private coreService: CoreService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    @Inject(DOCUMENT) private _doc: Document,
    private message: NzMessageService
  ) {
    const id = this.route.snapshot.queryParams['id'];
    this.windowName = this.coreService.electron() ? `report-page-${id}` : null;

    this.report$ = from(this.coreService.findReportById(id)).pipe(
      tap((report) => {
        if (this.coreService.remoteServer()) {
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
        }
        this.report = report;
      })
    );

    this.exportHTML = this.exportAsHTML.bind(this);
    this.exportPDF = this.exportAsPDF.bind(this);
  }

  async exportAsPDF() {
    const loading = this.message.loading(
      this.translate.instant('report.exporting', { type: 'PDF' }),
      { nzDuration: 0 }
    );
    const filePath = await this.coreService.exportReportPDF(this.report.id);
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
    const filePath = await this.coreService.exportReportHTML(this.report.id);
    this.message.remove(loading.messageId);
    filePath &&
      this.message.success(
        `${filePath} ${this.translate.instant('report.export_complete')}`
      );
  }
}
