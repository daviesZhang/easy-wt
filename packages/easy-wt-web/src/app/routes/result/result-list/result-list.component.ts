import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  GridApi,
  GridOptions,
  RowNode,
  ValueFormatterParams,
} from 'ag-grid-community';
import {
  GridTableComponent,
  GridTableReadyEvent,
  RequestData,
  Statistics,
  TemplateRendererComponent,
} from '@easy-wt/ui-shared';
import { CoreService } from '../../../core/core.service';
import { from, map, Observable } from 'rxjs';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { DatePipe } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import {
  addDays,
  endOfMonth,
  endOfToday,
  endOfWeek,
  startOfMonth,
  startOfToday,
  startOfWeek,
} from 'date-fns';

import {
  QueryParams,
  Report,
  StatReport,
  supportBrowserType,
} from '@easy-wt/common';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'easy-wt-result-list',
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.less'],
})
export class ResultListComponent implements OnInit {
  gridApi: GridApi;

  options: GridOptions<Omit<Report, 'actions'>>;

  getData: RequestData<any, any>;

  supportBrowserType = supportBrowserType;

  table!: GridTableComponent;
  @ViewChild('rowButtonTemplate', { static: true })
  rowButtonTemplate!: TemplateRef<NzSafeAny>;
  @ViewChild('exportTemplate', { static: true })
  exportTemplate: TemplateRef<NzSafeAny>;
  datePipe = new DatePipe('zh-CN');

  searchForm: UntypedFormGroup;

  rangeDate: { [key: string]: Array<Date> };

  autoRefresh: () => Observable<unknown>;

  constructor(
    private coreService: CoreService,
    private message: NzMessageService,
    private modal: NzModalService,
    private translate: TranslateService,
    private fb: UntypedFormBuilder
  ) {
    const now = new Date();
    const today = [startOfToday(), endOfToday()];
    const toWeek = [startOfWeek(now), endOfWeek(now)];
    const toMonth = [startOfMonth(now), endOfMonth(now)];
    const sevenDay = [addDays(startOfToday(), -6), endOfToday()];
    this.rangeDate = {
      [this.translate.instant('common.today')]: today,
      [this.translate.instant('common.seven_day')]: sevenDay,
      [this.translate.instant('common.to_week')]: toWeek,
      [this.translate.instant('common.to_month')]: toMonth,
    };
    this.searchForm = this.fb.group({
      casePath: [],
      name: [],
      browserType: [],
      beginTime: [sevenDay],
      success: [],
    });
  }

  transformer(statReport: StatReport): Statistics {
    let checkProportion = '100%';
    if (statReport.totalCheck) {
      checkProportion = `${(
        (statReport.totalSuccessCheck / statReport.totalCheck) *
        100
      ).toFixed(2)}%`;
    }
    return {
      key: 'report',
      label: this.translate.instant('report.stat.title'),
      data: [
        {
          key: 'success',
          value: statReport.success,
          label: this.translate.instant('report.stat.success'),
        },
        {
          key: 'totalCheck',
          value: statReport.totalCheck || '-',
          label: this.translate.instant('report.stat.total_check'),
        },
        {
          key: 'totalSuccessCheck',
          value: statReport.totalSuccessCheck || '-',
          label: this.translate.instant('report.stat.total_success_check'),
        },
        {
          key: 'checkProportion',
          value: checkProportion,
          label: this.translate.instant('report.stat.check_proportion'),
        },
      ],
    };
  }

  ngOnInit(): void {
    this.getData = (params: QueryParams) => {
      return from(this.coreService.findReportPage(params)).pipe(
        map((next) => {
          const [items, statisReport] = next;
          return {
            total: statisReport.count,
            statistics: [this.transformer(statisReport)],
            items,
          };
        })
      );
    };
    this.options = {
      rowSelection: 'multiple',
      suppressRowClickSelection: true,
      getRowId: (params) => params.data.id.toString(),
      columnDefs: [
        {
          headerName: this.translate.instant('common.id'),
          field: 'id',
          hide: true,
        },
        {
          headerName: this.translate.instant('report.field.case_path'),
          field: 'casePath',
          sortable: true,
          checkboxSelection: true,
          headerCheckboxSelection: true,
        },
        {
          headerName: this.translate.instant('report.field.name'),
          field: 'name',
          sortable: true,
          minWidth: 100,
          flex: 1,
          cellRenderer: TemplateRendererComponent,
          cellRendererParams: {
            ngTemplate: this.rowButtonTemplate,
          },
        },
        {
          headerName: this.translate.instant('report.field.browser_type'),
          field: 'browserType',
          sortable: false,
          minWidth: 100,
          maxWidth: 120,
        },
        {
          headerName: this.translate.instant('report.field.success'),
          field: 'success',
          cellDataType: false,
          valueFormatter: (params) =>
            this.translate.instant('report.field.success_' + params.value),
          minWidth: 80,
          maxWidth: 110,
          cellRenderer: TemplateRendererComponent,
          cellRendererParams: {
            ngTemplate: this.exportTemplate,
          },
          cellClassRules: {
            'failure-row': (params) => !params.data.success,
          },
        },
        {
          headerName: this.translate.instant('report.field.time'),
          type: 'numericColumn',
          valueFormatter: (params) =>
            `${((params.data.endTime - params.data.beginTime) / 1000).toFixed(
              2
            )}`,
          minWidth: 90,
        },
        {
          headerName: this.translate.instant('report.field.total_check'),
          field: 'totalCheck',
          sortable: true,
          type: 'numericColumn',
          minWidth: 90,
        },
        {
          headerName: this.translate.instant('report.field.success_count'),
          field: 'successCount',
          sortable: true,

          type: 'numericColumn',
          valueFormatter: (params) => {
            if (params.data.totalCheck) {
              return `${params.value}(${(
                (params.data.successCount / params.data.totalCheck) *
                100
              ).toFixed(2)}%)`;
            }
            return params.value;
          },
        },
        {
          headerName: this.translate.instant('common.begin_time'),
          field: 'beginTime',
          sortable: true,
          sort: 'desc',
          width: 165,
          valueFormatter: this.dateFormatter.bind(this),
        },
        {
          headerName: this.translate.instant('common.end_time'),
          field: 'endTime',
          sortable: true,
          width: 165,
          valueFormatter: this.dateFormatter.bind(this),
        },
      ],
    };
  }

  dateFormatter(params: ValueFormatterParams): string {
    if (params.value) {
      return this.datePipe.transform(params.value, 'yyyy-MM-dd HH:mm:ss');
    }
    return params.value;
  }

  onGridReady($event: GridTableReadyEvent) {
    this.gridApi = $event.event.api;
    this.table = $event.gridTable;
    this.search();
    this.autoRefresh = this.table.refreshRowsData.bind(this.table);
  }

  async openReport(node: RowNode) {
    this.coreService.openReportPage(node.data.id).then();
  }

  search() {
    const query = Object.assign({}, this.searchForm.value);
    if (query.beginTime && query.beginTime.length) {
      query.beginTime = query.beginTime.map((item) => item.getTime());
    }
    this.table.searchRowsData(query);
  }

  async exportPDF(node: RowNode) {
    const loading = this.message.loading(
      this.translate.instant('report.exporting', { type: 'PDF' }),
      { nzDuration: 0 }
    );
    try {
      const filePath = await this.coreService.exportReportPDF(node.data.id);
      this.message.remove(loading.messageId);
      filePath &&
        this.message.success(
          `${filePath} ${this.translate.instant('report.export_complete')}`
        );
    } catch (err) {
      this.message.remove(loading.messageId);
      console.error(err);
      this.message.error(this.translate.instant('report.export_error'));
    }
  }

  async exportHTML(node: RowNode) {
    const loading = this.message.loading(
      this.translate.instant('report.exporting', { type: 'HTML' }),
      { nzDuration: 0 }
    );
    try {
      const filePath = await this.coreService.exportReportHTML(node.data.id);
      this.message.remove(loading.messageId);
      filePath &&
        this.message.success(
          `${filePath} ${this.translate.instant('report.export_complete')}`
        );
    } catch (err) {
      this.message.remove(loading.messageId);
      console.error(err);
      this.message.error(this.translate.instant('report.export_error'));
    }
  }

  async deleteReport() {
    const rows = this.gridApi.getSelectedRows();
    if (!rows.length) {
      return;
    }

    this.modal.confirm({
      nzContent: this.translate.instant('report.delete_confirm'),
      nzOkDanger: true,
      nzOkText: this.translate.instant('common.delete'),
      nzAutofocus: 'ok',
      nzOnOk: async () => {
        const nodes: Report[] = this.gridApi.getSelectedRows();
        if (nodes && nodes.length) {
          const messageId = this.message.loading(
            this.translate.instant('common.deleting')
          ).messageId;
          await this.coreService.deleteReport(nodes.map((node) => node.id));
          this.message.remove(messageId);
          this.message.success(this.translate.instant('common.delete_success'));
          this.table.searchRowsData();
        }
      },
    });
  }
}
