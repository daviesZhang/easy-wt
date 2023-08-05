import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../../core/core.service';
import { of, Subject } from 'rxjs';
import { LoggerEventData } from '@easy-wt/common';

import { GridApi, GridOptions } from 'ag-grid-community';
import { GridTableReadyEvent, RequestData } from '@easy-wt/ui-shared';
import { GridHeaderComponent } from '../grid-header/grid-header.component';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { MessageRendererComponent } from '../message-renderer/message-renderer.component';
import { ThemeService } from '../../../core/theme.service';

export type logMessage = LoggerEventData & { id: number; time: string };

@Component({
  selector: 'easy-wt-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss'],
})
export class ConsoleComponent implements OnInit {
  electron = false;

  gridApi: GridApi;

  index = 0;

  gridTheme = 'ag-theme-balham';
  lightTheme = true;

  options: GridOptions<logMessage> = {
    components: { noRowsOverlay: undefined },
    overlayNoRowsTemplate: this.translate.instant('log_console.no_rows'),
    getRowId: (params) => params.data.id.toString(),
    suppressRowClickSelection: true,
    suppressCellFocus: true,
    enableCellTextSelection: true,
    columnDefs: [
      {
        getQuickFilterText: (params) => {
          return `${params.data.time} ${params.data.level} ${params.data.label} ${params.data.message}`;
        },
        suppressMovable: true,
        resizable: false,
        field: 'message',
        wrapText: true,
        headerComponent: GridHeaderComponent,
        headerComponentParams: {},
        autoHeight: true,
        width: 600,
        flex: 1,
        sortable: false,
        cellRenderer: MessageRendererComponent,
      },
    ],
  };

  message$ = new Subject<LoggerEventData>();
  getData: RequestData<logMessage, unknown> = () => of({ items: [], total: 0 });

  constructor(
    private core: CoreService,
    protected theme: ThemeService,
    private translate: TranslateService
  ) {
    this.electron = this.core.electron();
  }

  ngOnInit(): void {
    if (this.electron) {
      this.getLogger();
    } else {
      //
    }
    this.message$.subscribe((next) => {
      if (this.gridApi && next) {
        this.index++;
        const { time, level, ...other } = next;
        const time_str = format(time, 'yyyy-MM-dd HH:mm:ss');
        this.gridApi.applyTransaction({
          add: [
            {
              ...other,
              time: time_str,
              level: level.toUpperCase(),
              id: this.index,
            },
          ],
          addIndex: 0,
        });
      }
    });
  }

  getLogger() {
    window.electron.onMainEvent('log_event', (event, [message]) => {
      this.message$.next(message);
    });
  }

  onGridReady(event: GridTableReadyEvent) {
    this.gridApi = event.event.api;
  }
}
