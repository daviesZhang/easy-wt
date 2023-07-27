import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  CellEditingStoppedEvent,
  GridApi,
  GridOptions,
  IRowNode,
  ValueFormatterParams,
} from 'ag-grid-community';
import { CoreService } from '../../../core/core.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { DatePipe } from '@angular/common';
import { ISchedule, QueryParams } from '@easy-wt/common';
import { from, map } from 'rxjs';
import {
  CommonJsonOptionsComponent,
  GridTableComponent,
  GridTableReadyEvent,
  RequestData,
} from '@easy-wt/ui-shared';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CronEditorComponent } from '../../../components/cron-editor/cron-editor.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'easy-wt-schedule-list',
  templateUrl: './schedule-list.component.html',
  styleUrls: ['./schedule-list.component.less'],
})
export class ScheduleListComponent implements OnInit {
  gridApi: GridApi;

  options: GridOptions;

  getData: RequestData<any, any>;

  table!: GridTableComponent;

  @ViewChild('rowButtonTemplate', { static: true })
  rowButtonTemplate!: TemplateRef<NzSafeAny>;

  datePipe = new DatePipe('zh-CN');

  searchForm: UntypedFormGroup;

  constructor(
    private coreService: CoreService,
    private translate: TranslateService,
    private message: NzMessageService,
    private modal: NzModalService,
    private fb: UntypedFormBuilder
  ) {
    this.searchForm = this.fb.group({
      caseName: [],
      caseId: [],
      name: [],
    });
  }

  ngOnInit(): void {
    this.getData = (params: QueryParams) => {
      return from(this.coreService.findSchedulePage(params)).pipe(
        map((next) => {
          const [items, count] = next;
          return {
            total: count,
            items,
          };
        })
      );
    };
    this.options = {
      rowSelection: 'multiple',
      suppressRowClickSelection: true,
      onCellEditingStopped: (event: CellEditingStoppedEvent) => {
        if (event.newValue === undefined) {
          return;
        }

        const data = {
          id: event.data.id,
          [event.colDef.field]: event.newValue,
        };
        this.coreService.saveAndCreate([data]).then();
      },
      getRowId: (params) => params.data.id.toString(),
      columnDefs: [
        { headerName: 'ID', field: 'id', hide: true },
        {
          headerName: this.translate.instant('schedule.field.name'),
          field: 'name',
          sortable: true,
          checkboxSelection: true,
          headerCheckboxSelection: true,
          editable: true,
          filter: 'agTextColumnFilter',
          flex: 1,
        },
        {
          headerName: this.translate.instant('schedule.field.case_name'),
          field: 'scriptCase.name',
          sortable: true,
          flex: 1,
        },

        {
          headerName: this.translate.instant('schedule.field.cron'),
          field: 'cron',
          sortable: false,
          flex: 1,
          editable: true,
          cellEditor: CronEditorComponent,
        },
        {
          headerName: this.translate.instant('schedule.field.enable'),
          field: 'enable',
          sortable: false,
          width: 120,
          editable: true,
          onCellValueChanged: (event) => {
            this.updateNextDate({ node: event.node, data: event.data }).then();
          },
        },
        {
          headerName: this.translate.instant('schedule.field.params'),
          field: 'params',
          sortable: false,
          flex: 2,
          equals: (a, b) => JSON.stringify(a) === JSON.stringify(b),
          cellRenderer: CommonJsonOptionsComponent,
          hide: true,
          editable: true,
          cellRendererParams: {
            renderer: true,
          },
          cellEditor: CommonJsonOptionsComponent,
        },
        {
          headerName: this.translate.instant('schedule.next_time'),
          field: 'nextDate',
          sortable: true,
          width: 165,
          onCellClicked: this.updateNextDate.bind,
          valueFormatter: this.dateFormatter.bind(this),
        },
        {
          headerName: this.translate.instant('schedule.field.last_date'),
          field: 'lastDate',
          sortable: true,
          width: 165,
          valueFormatter: this.dateFormatter.bind(this),
        },
      ],
    };
  }

  async updateNextDate(event: { data: ISchedule; node: IRowNode }) {
    if (event.data && event.data.enable && event.data.cron) {
      const nextTime = await this.coreService.getCronNextDate(event.data.cron);
      event.node.setDataValue('nextDate', nextTime);
    } else {
      event.node.setDataValue('nextDate', null);
    }
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
  }

  onDelete() {
    this.modal.confirm({
      nzContent: this.translate.instant('common.ask_confirm'),
      nzOkDanger: true,
      nzOkText: this.translate.instant('common.delete'),
      nzOnOk: async () => {
        const nodes: ISchedule[] = this.gridApi.getSelectedRows();
        if (nodes && nodes.length) {
          const messageId = this.message.loading(
            this.translate.instant('common.deleting')
          ).messageId;
          await this.coreService.deleteSchedule(nodes.map((node) => node.id));
          this.message.remove(messageId);
          this.message.success(this.translate.instant('common.delete_success'));
          this.table.searchRowsData();
        }
      },
    });
  }

  onSearch() {
    this.table.searchRowsData(this.searchForm.value);
  }
}
