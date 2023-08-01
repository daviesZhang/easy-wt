import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { debounceTime, fromEventPattern, Observable, of, Subject } from 'rxjs';
import { NzProgressStatusType } from 'ng-zorro-antd/progress';
import { NzMessageService } from 'ng-zorro-antd/message';
import { GridColumnDef, Page, RequestDelete, Statistics } from '../api';
import { LoadingOverlayComponent } from '../loading-overlay/loading-overlay.component';
import { EmptyOverlayComponent } from '../empty-overlay/empty-overlay.component';
import { catchError, take, takeUntil } from 'rxjs/operators';

import {
  ColumnApi,
  ColumnMovedEvent,
  ColumnResizedEvent,
  FirstDataRenderedEvent,
  GridApi,
  GridOptions,
  GridReadyEvent,
  RowNode,
  SortChangedEvent,
  ValueFormatterParams,
} from 'ag-grid-community';

import {
  DefaultNgxGridTableConfig,
  GRID_TABLE_CONFIG,
  GridTableConfig,
  GridTablePagination,
} from '../ngx-grid-table-config';
import { NgxGridTableTranslateService } from '../ngx-grid-table-translate.service';
import { Clipboard } from '@angular/cdk/clipboard';

export declare type GridTableReadyEvent = {
  event: GridReadyEvent;
  gridTable: GridTableComponent;
};

export declare type RequestDataType<T> = T extends GridTableConfig
  ? ReturnType<T['dataParams']>
  : T;

export type RequestData<T, V> = (
  params: RequestDataType<V>
) => Observable<Page<T>>;

@Component({
  selector: 'easy-wt-grid-table',
  templateUrl: './grid-table.component.html',
  styleUrls: ['./grid-table.component.less'],
})
export class GridTableComponent implements OnInit, OnDestroy {
  gridOptions!: GridOptions;
  /**
   * 填入一个唯一KEY
   * 开启保存当前设置的列宽和列排序
   */
  @Input() saveColumnDefKey: string;
  /**
   * 表格唯一主键
   */

  /**
   * 当网格准备就绪时是否立即请求数据
   */
  @Input() initLoadData = true;
  /**
   * 表格使用的主题
   * 另外可选推荐用：ag-theme-alpine | ag-theme-balham
   */
  @Input() gridTheme = 'ag-theme-balham';
  /**
   * 表格附加样式
   */
  @Input() gridTableClass = [];
  /**
   * 表格附加样式
   */
  @Input() gridTableStyle: { [key: string]: any } = {};
  /**
   * 是否显示表格底部 包含分页和操作区域
   */
  @Input() showFooter = true;
  /**
   * 是否显示表格底部的操作区域
   */
  @Input() showFooterAction:
    | false
    | { autoRefresh?: boolean; export?: boolean } = { export: true };
  /**
   * 不将统计数据展示为底部统计面板
   */
  @Input() suppressGridStatisticsBar = true;
  /**
   * 不将统计数据展示为底部固定列
   */
  @Input() suppressGridStatisticsRow = true;
  /**
   * 是否显示默认页脚
   */
  @Input() showDefaultStatusBar = false;
  /**
   * total=总数据条数
   * items=当前页数据
   * footerItems=页脚数据
   */
  @Input() getData!: RequestData<unknown, any>;
  /**
   * 删除方法
   */
  @Input() deleteFunc: RequestDelete | undefined = undefined;
  /**
   * 自动刷新的方法
   */
  @Input() autoRefresh = this.autoRefreshHandle.bind(this);
  /**
   * 刷新的间隔
   */
  @Input() refreshInterval = 5;
  /**
   * 是否启用服务端排序
   */
  @Input() serverSort = true;
  @Input() options!: GridOptions;

  @Input() config?: Partial<GridTableConfig>;
  @Output()
  pageIndexChange = new EventEmitter<number>();
  @Output()
  pageSizeChange = new EventEmitter<number>();
  @Output()
  gridReady = new EventEmitter<GridTableReadyEvent>();
  /**
   * 当触发表格
   */
  @Output()
  refreshData = new EventEmitter<Page<any>>();
  @Output()
  deleteRow = new EventEmitter<RowNode[] | boolean>();
  /**
   * 分页设定组件参数
   */
  @Input() gridTablePagination?: false | GridTablePagination;
  defaultStatusPanels = [
    { statusPanel: 'agFilteredRowCountComponent' },
    { statusPanel: 'agSelectedRowCountComponent' },
    { statusPanel: 'agAggregationComponent' },
  ];
  defaultFrameworkComponents = {
    loadingOverlay: LoadingOverlayComponent,
    noRowsOverlay: EmptyOverlayComponent,
  };
  currentPage = 1;
  currentPageSize = 100;
  total = 0;
  destroy$ = new Subject<void>();
  showProgress = false;
  progressPercent = 0;
  progressStatus: NzProgressStatusType = 'normal';
  selectedNodes: RowNode[] = [];
  dataLoading = false;
  api!: GridApi;
  columnApi!: ColumnApi;
  statistics: Array<Statistics> = [];
  @ViewChild('deleteContent', { static: true })
  deleteContent!: TemplateRef<any>;
  gridTableConfig: DefaultNgxGridTableConfig;
  rowButtonColId = '__action__';

  private queryParams: { [key: string]: unknown } = {};

  constructor(
    private msg: NzMessageService,
    @Inject(GRID_TABLE_CONFIG) gridTableConfig: DefaultNgxGridTableConfig,
    private gridService: NgxGridTableTranslateService,
    private clipboard: Clipboard,
    private cdr: ChangeDetectorRef
  ) {
    this.gridTableConfig = Object.assign(
      {},
      new DefaultNgxGridTableConfig(),
      gridTableConfig
    );
  }

  ngOnInit(): void {
    if (this.config) {
      this.gridTableConfig = Object.assign(
        {},
        this.gridTableConfig,
        this.config
      );
    }
    if (
      this.gridTablePagination === undefined &&
      this.gridTableConfig.gridTablePagination !== undefined
    ) {
      this.gridTablePagination = this.gridTableConfig.gridTablePagination;
    }
    if (this.gridTablePagination) {
      this.currentPage = this.gridTablePagination.initIndex;
      this.currentPageSize = this.gridTablePagination.initPageSize;
    }

    if (this.options.components) {
      this.options.components = {
        ...this.defaultFrameworkComponents,
        ...this.options.components,
      };
    } else {
      this.options.components = this.defaultFrameworkComponents;
    }

    let defaultColDef = Object.assign(
      {},
      this.gridTableConfig.defaultColDef || {}
    );
    if (this.options.defaultColDef) {
      defaultColDef = { ...defaultColDef, ...this.options.defaultColDef };
    }
    let onGridReady: ((event: GridReadyEvent) => void) | null = null;
    if (this.options.onGridReady) {
      onGridReady = this.options.onGridReady;
    }
    let onSortChanged: ((event: SortChangedEvent) => void) | null = null;
    if (this.options.onSortChanged) {
      onSortChanged = this.options.onSortChanged;
    }
    let onFirstDataRendered: ((event: FirstDataRenderedEvent) => void) | null =
      null;
    if (this.options.onFirstDataRendered) {
      onFirstDataRendered = this.options.onFirstDataRendered;
    }

    this.gridOptions = {
      enableCellChangeFlash: true,
      getRowId: (params) => params.data.id,
      animateRows: true,
      getLocaleText: (key) => this.gridService.translate(key.key),
      loadingOverlayComponent: 'loadingOverlay',
      noRowsOverlayComponent: 'noRowsOverlay',
      ...this.options,
      onSortChanged: (params) => {
        if (this.serverSort) {
          this.refreshRowsData();
        }
        if (onSortChanged) {
          onSortChanged(params);
        }
      },
      onFirstDataRendered: (event: FirstDataRenderedEvent) => {
        if (onFirstDataRendered) {
          onFirstDataRendered(event);
        }
      },
      onGridReady: (event: GridReadyEvent) => {
        this.api = event.api;
        this.columnApi = event.columnApi;
        if (this.initLoadData) {
          this.searchRowsData();
        }
        if (this.saveColumnDefKey) {
          const def = this.getGridColumnDef(this.saveColumnDefKey);
          if (def) {
            if (def.width) {
              const widths = Object.entries(def.width).map(([key, value]) => ({
                key,
                newWidth: value,
              }));
              this.columnApi.setColumnWidths(widths);
            }
            if (def.columnSort) {
              setTimeout(() => {
                this.columnApi.moveColumns(def.columnSort, 0);
              }, 300);
            }
          }
          this.fromEvent('columnResized')
            .pipe(debounceTime(100))
            .subscribe((event: ColumnResizedEvent) =>
              this.onColumnResized(event)
            );
          this.fromEvent('columnMoved').subscribe((event: ColumnMovedEvent) =>
            this.onColumnMovedEvent(event)
          );
        }

        if (onGridReady) {
          onGridReady(event);
        }
        this.gridReady.emit({ event, gridTable: this });
      },
      defaultColDef,
    };
  }

  fromEvent(eventType: string) {
    return fromEventPattern(
      (handler) => this.api.addEventListener(eventType, handler),
      (handler) => this.api.removeEventListener(eventType, handler)
    ).pipe(takeUntil(this.destroy$));
  }

  onColumnMovedEvent(event: ColumnMovedEvent<any>) {
    if (event.finished) {
      const sort = event.columnApi.getAllGridColumns().map((c) => c.getId());
      this.saveGridColumnDef(this.saveColumnDefKey, { columnSort: sort });
    }
  }

  onColumnResized(event: ColumnResizedEvent<any>) {
    const width: { [key: string]: number } = {};
    event.columns.forEach((column) => {
      width[column.getId()] = column.getActualWidth();
    });
    this.saveGridColumnDef(this.saveColumnDefKey, { width: width });
  }

  saveGridColumnDef(
    key: string,
    data: {
      columnSort?: GridColumnDef['columnSort'];
      width?: GridColumnDef['width'];
    }
  ) {
    const old = this.getGridColumnDef(key) || {};
    const { width, columnSort } = data;
    if (columnSort) {
      Object.assign(old, { columnSort });
    }
    if (width) {
      Object.assign(old, { width: Object.assign({}, old['width'], width) });
    }
    localStorage.setItem(key, JSON.stringify(old));
  }

  getGridColumnDef(key: string): GridColumnDef | null {
    try {
      return JSON.parse(localStorage.getItem(key)) as GridColumnDef;
    } catch (e) {
      return null;
    }
  }

  cleanGridColumnDef() {
    localStorage.removeItem(this.saveColumnDefKey);
    this.columnApi.resetColumnState();
  }

  statisticsDataToRowData(statistics: Statistics[]): Array<any> {
    return statistics.map((data) => {
      return data.data
        .map((item) => {
          return { [item.key]: item.value };
        })
        .reduce(
          (previousValue, currentValue) =>
            Object.assign({}, previousValue, currentValue),
          { _classname: data.className }
        );
    });
  }

  autoRefreshHandle(): Observable<any> {
    return this.refreshRowsData();
  }

  /**
   * 重新搜索数据
   */
  searchRowsData(params?: {
    [key: string]: unknown;
  }): Observable<Page<any> | null> {
    this.currentPage = 1;
    if (params) {
      this.queryParams = params;
    }
    return this.refreshRowsData();
  }

  refreshRowsData(): Observable<Page<unknown> | null> {
    this.api.deselectAll();
    return this.serverClientData(this.queryParams);
  }

  onPageSizeChange(event: number) {
    this.pageSizeChange.emit(event);
    this.currentPageSize = event;
    this.searchRowsData();
  }

  onPageIndexChange(event: number) {
    this.pageSizeChange.emit(event);
    this.currentPage = event;
    this.refreshRowsData();
  }

  /**
   * 键盘事件处理
   *
   * @param event
   */
  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
      const cell = this.api.getFocusedCell();
      if (!cell) {
        return;
      }
      const node = this.api.getDisplayedRowAtIndex(cell.rowIndex);
      if (!node) {
        return;
      }
      const value = this.api.getValue(cell.column, node);
      let text = value;
      const colDef = cell.column.getColDef();
      if (typeof colDef.valueFormatter === 'string') {
        text = colDef.valueFormatter;
      } else if (typeof colDef.valueFormatter === 'function') {
        const params: ValueFormatterParams = {
          value,
          node: node,
          column: cell.column,
          api: this.api,
          columnApi: this.columnApi,
          data: node.data,
          colDef: colDef,
          context: {},
        };
        text = colDef.valueFormatter(params);
      } else if (event.target && event.target instanceof Element) {
        text = event.target.textContent;
      }
      this.clipboard.copy(text);
      this.api.flashCells({ rowNodes: [node], columns: [cell.column] });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 获取当前排序字段
   * @private
   */
  private getSorts(): { [key: string]: 'order' | 'asc' } {
    const sort: { [key: string]: 'order' | 'asc' } = {};
    const columnState = this.columnApi.getColumnState();
    if (!columnState || !columnState.length) {
      return sort;
    }
    columnState
      .filter((state) => state.sort)
      .sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0))
      .forEach((state) => {
        if (typeof state.colId === 'string') {
          Object.assign(sort, {
            [state.colId]: (state.sort || 'asc').toLowerCase() as string,
          });
        }
      });
    return sort;
  }

  /**
   * 客户端模式从服务端获取数据
   * @param queryParams
   */
  private serverClientData(queryParams: {
    [key: string]: any;
  }): Observable<Page<any> | null> {
    const complete$ = new Subject<Page<any> | null>();
    const sorts = this.getSorts();
    if (sorts) {
      Object.assign(queryParams, {
        orderBys: sorts,
      });
    }
    if (this.showFooter && this.gridTablePagination) {
      Object.assign(queryParams, {
        size: this.currentPageSize,
        current: this.currentPage,
      });
    }
    this.api.showLoadingOverlay();
    if (!this.suppressGridStatisticsRow) {
      this.api.setPinnedBottomRowData([]);
    }
    this.dataLoading = true;
    this.getData(
      this.gridTableConfig.dataParams
        ? this.gridTableConfig.dataParams({ ...queryParams })
        : { ...queryParams }
    )
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          console.error(err);
          return of({ total: 0, items: [], statistics: [] });
        })
      )
      .subscribe({
        next: (response) => {
          this.refreshData.emit(response);
          complete$.next(response);
          this.api.setRowData(response.items);
          this.statistics = response.statistics || [];
          if (!this.suppressGridStatisticsRow && this.statistics.length) {
            this.api.setPinnedBottomRowData(
              this.statisticsDataToRowData(this.statistics)
            );
          } else {
            this.api.setPinnedBottomRowData([]);
          }
          this.total = response.total;
          if (!response.items.length) {
            this.api.showNoRowsOverlay();
          } else {
            this.api.hideOverlay();
          }
          this.dataLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => complete$.error(error),
      });
    return complete$.asObservable().pipe(take(1));
  }
}
