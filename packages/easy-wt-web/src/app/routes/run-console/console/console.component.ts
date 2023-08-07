import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CoreService } from '../../../core/core.service';
import { of, Subject, takeUntil } from 'rxjs';
import { ELECTRON_IPC_EVENT, LoggerEventData } from '@easy-wt/common';

import { GridApi, GridOptions } from 'ag-grid-community';
import {
  GridTableReadyEvent,
  RequestData,
  ThemeService,
} from '@easy-wt/ui-shared';
import { GridHeaderComponent } from '../grid-header/grid-header.component';
import { TranslateService } from '@ngx-translate/core';

import { MessageRendererComponent } from '../message-renderer/message-renderer.component';

export type logMessage = LoggerEventData & { id: number };

@Component({
  selector: 'easy-wt-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss'],
})
export class ConsoleComponent implements OnInit, OnDestroy {
  electron = false;

  gridApi: GridApi;

  index = 0;

  destroy$ = new Subject();

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
          return `${params.data.timestamp} ${params.data.level} ${params.data.label} ${params.data.message}`;
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

  currentTheme: string;
  constructor(
    private core: CoreService,
    protected theme: ThemeService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.electron = this.core.electron();
    this.theme.currentGridTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((next) => {
        this.currentTheme = next;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
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
        const { level, ...other } = next;

        this.gridApi.applyTransaction({
          add: [
            {
              ...other,
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
    window.electron.onMainEvent(
      ELECTRON_IPC_EVENT.CONSOLE_LOG,
      (event, message) => {
        this.message$.next(message);
      }
    );
  }

  onGridReady(event: GridTableReadyEvent) {
    this.gridApi = event.event.api;
  }
}
