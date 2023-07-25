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
  ViewChild
} from "@angular/core";
import {concat, merge, Observable, of, Subject} from "rxjs";
import {NzProgressStatusType} from "ng-zorro-antd/progress";
import {NzMessageService} from "ng-zorro-antd/message";
import {NzModalService} from "ng-zorro-antd/modal";
import {Page, RequestDelete, RowButton, Statistics} from "../api";
import {LoadingOverlayComponent} from "../loading-overlay/loading-overlay.component";
import {EmptyOverlayComponent} from "../empty-overlay/empty-overlay.component";
import {catchError, take, takeUntil, tap} from "rxjs/operators";

import {
  ColDef,
  ColumnApi,
  ExcelCell,
  FirstDataRenderedEvent,
  GridApi,
  GridOptions,
  GridReadyEvent,
  IServerSideGetRowsParams,
  RowNode,
  SortChangedEvent
} from "ag-grid-community";

import {TemplateRendererComponent} from "../template-renderer/template-renderer.component";
import {
  DefaultNgxGridTableConfig,
  GRID_TABLE_CONFIG,
  GridTableConfig,
  GridTablePagination
} from "../ngx-grid-table-config";
import {NgxGridTableTranslateService} from "../ngx-grid-table-translate.service";
import {Clipboard} from '@angular/cdk/clipboard';
import {ValueFormatterParams} from "ag-grid-community/dist/lib/entities/colDef";


export declare type GridTableReadyEvent = { event: GridReadyEvent, gridTable: GridTableComponent }

export declare type RequestDataType<T> = T extends GridTableConfig ? ReturnType<T["dataParams"]> : T;

export type RequestData<T, V> = (params: RequestDataType<V>) => Observable<Page<T>>


@Component({
  selector: "easy-wt-grid-table",
  templateUrl: "./grid-table.component.html",
  styleUrls: ["./grid-table.component.less"]


})
export class GridTableComponent implements OnInit, OnDestroy {

  gridOptions!: GridOptions;
  /**
   * 表格名称
   * 导出时作为文件名
   */
  @Input() gridName = "";
  /**
   * 表格唯一主键
   */
  @Input() key: string | number = Math.floor(Math.random() * 1000000) + "_" + (new Date().getTime() - 1564366251225);
  /**
   * 当网格准备就绪时是否立即请求数据
   */
  @Input() initLoadData = true;
  /**
   * 表格使用的主题
   * 另外可选推荐用：ag-theme-alpine | ag-theme-balham
   */
  @Input() gridTheme = "ag-theme-balham";
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
  @Input() showFooterAction: false | { autoRefresh?: boolean, export?: boolean } = {export: true};
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
  @Input() rowButton?: RowButton | null;
  @Input() topButton?: { left?: TemplateRef<any>, center?: TemplateRef<any>, right?: TemplateRef<any> };
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
    {statusPanel: "agFilteredRowCountComponent"},
    {statusPanel: "agSelectedRowCountComponent"},
    {statusPanel: "agAggregationComponent"}
  ];
  defaultFrameworkComponents = {
    loadingOverlay: LoadingOverlayComponent,
    noRowsOverlay: EmptyOverlayComponent
  };
  currentPage = 1;
  currentPageSize = 100;
  total = 0;
  destroy$ = new Subject<void>();
  showProgress = false;
  progressPercent = 0;
  progressStatus: NzProgressStatusType = "normal";
  selectedNodes: RowNode[] = [];
  dataLoading = false;
  api!: GridApi;
  columnApi!: ColumnApi;
  statistics: Array<Statistics> = [];
  @ViewChild("deleteContent", {static: true}) deleteContent!: TemplateRef<any>;
  gridTableConfig: DefaultNgxGridTableConfig;
  rowButtonColId = "__action__";
  /**
   * 是否为树数据
   * @private
   */
  private treeData = false;
  private queryParams: { [key: string]: unknown; } = {};

  constructor(private msg: NzMessageService,
              private modal: NzModalService,
              @Inject(GRID_TABLE_CONFIG) gridTableConfig: DefaultNgxGridTableConfig,
              private gridService: NgxGridTableTranslateService,
              private clipboard: Clipboard,
              private cdr: ChangeDetectorRef) {
    this.gridTableConfig = Object.assign({}, new DefaultNgxGridTableConfig(), gridTableConfig);
  }

  ngOnInit(): void {
    if (this.config) {
      this.gridTableConfig = Object.assign({}, this.gridTableConfig, this.config);
    }
    if (this.gridTablePagination === undefined && this.gridTableConfig.gridTablePagination !== undefined) {
      this.gridTablePagination = this.gridTableConfig.gridTablePagination;
    }
    if (this.gridTablePagination) {
      this.currentPage = this.gridTablePagination.initIndex;
      this.currentPageSize = this.gridTablePagination.initPageSize;
    }

    this.treeData = this.options.treeData || false;
    //this.nextDataSubscribe();
    if (this.options.components) {
      this.options.components = {
        ...this.defaultFrameworkComponents,
        ...this.options.components
      };
    } else {
      this.options.components = this.defaultFrameworkComponents;
    }


    let defaultColDef = Object.assign({}, this.gridTableConfig.defaultColDef || {});
    if (this.options.defaultColDef) {
      defaultColDef = {...defaultColDef, ...this.options.defaultColDef};
    }
    let onGridReady: ((event: GridReadyEvent) => void) | null = null;
    if (this.options.onGridReady) {
      onGridReady = this.options.onGridReady;

    }
    let onSortChanged: ((event: SortChangedEvent) => void) | null = null;
    if (this.options.onSortChanged) {
      onSortChanged = this.options.onSortChanged;

    }
    let onFirstDataRendered: ((event: FirstDataRenderedEvent) => void) | null = null;
    if (this.options.onFirstDataRendered) {
      onFirstDataRendered = this.options.onFirstDataRendered;
    }

    if (this.rowButton) {
      const cell = {
        colId: this.rowButtonColId,
        chartDataType: "excluded",
        headerName: this.rowButton.headerName || "",
        cellRenderer: TemplateRendererComponent,
        cellRendererParams: {ngTemplate: this.rowButton.template},
        sortable: false,
        suppressCellFlash: true,
        suppressSizeToFit: true,
        editable: false
      } as ColDef;
      if (this.rowButton.first) {
        this.options.columnDefs = [cell].concat(this.options.columnDefs || []);
      } else {
        this.options.columnDefs && this.options.columnDefs.push(cell);
      }
    }

    this.gridOptions = {
      enableCellChangeFlash: true,
      getRowId: (params) => params.data.id,
      animateRows: true,
      getLocaleText: (key) => this.gridService.translate(key.key),
      loadingOverlayComponent: "loadingOverlay",
      noRowsOverlayComponent: "noRowsOverlay",
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
        if (this.rowButton) {
          event.columnApi.autoSizeColumn(this.rowButtonColId);
        }
      },
      onGridReady: (event: GridReadyEvent) => {
        this.api = event.api;
        this.columnApi = event.columnApi;
        if (this.initLoadData) {
          this.searchRowsData();
        }
        if (onGridReady) {
          onGridReady(event);
        }
        this.gridReady.emit({event, gridTable: this});
      },
      defaultColDef
    };

  }

  statisticsDataToRowData(statistics: Statistics[]): Array<any> {
    return statistics.map(data => {
      return data.data.map(item => {
        return {[item.key]: item.value};
      })
        .reduce((previousValue, currentValue) => Object.assign({}, previousValue, currentValue), {_classname: data.className});
    });
  }

  autoRefreshHandle(): Observable<any> {
    return this.refreshRowsData();

  }

  /**
   * 重新搜索数据
   */
  searchRowsData(params ?: { [key: string]: unknown }): Observable<Page<any> | null> {
    this.currentPage = 1;
    if (params) {
      this.queryParams = params;
    }
    return this.refreshRowsData();
  }

  refreshRowsData(): Observable<Page<unknown> | null> {
    this.api.deselectAll();
    if (this.gridOptions.rowModelType === 'clientSide') {
      return this.serverSideData(this.queryParams);
    } else {
      return this.serverClientData(this.queryParams);
    }


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
   * 客户端模式导出全部数据
   * 分页请求数据，然后前端组装导出
   * @param pageSize 页大小，默认100
   * @param maxRequestCount 并发请求数 默认3
   */
  exportAllPageData(pageSize = 100, maxRequestCount = 3) {
    let allData: Array<any> = [];
    this.showProgress = true;
    this.initProgress();
    let currentPage = 1;
    const currentPageSize = pageSize;
    const totalPage = parseInt(this.total / currentPageSize + (this.total % currentPageSize ? 1 : 0) + "", 10);
    /*if (this.currentPage === currentPage && this.currentPageSize === currentPageSize && this.rowData.length) {
      allData = allData.concat(this.rowData);
      currentPage = currentPage + 1;
    }*/
    const sorts = this.getSorts();

    const params = {size: currentPageSize};
    if (sorts) {
      Object.assign(params, {orderBys: sorts});
    }
    const request$: Array<Observable<{ total: number, items: any[], footerItems?: Array<any> }>> = [];
    for (; currentPage <= totalPage; currentPage++) {
      const queryParams = this.gridTableConfig.dataParams ? this.gridTableConfig.dataParams({
        ...params,
        current: currentPage
      }) : {...params, current: currentPage};
      request$.push(this.getData(queryParams));
    }

    const _percent = 100 / request$.length;
    const requestArray$ = this.arrayPartition(request$, maxRequestCount).map(requests$ => {
      return merge(...requests$);
    });
    concat(...requestArray$).pipe(tap(next => {
      const percent = parseFloat((this.progressPercent + _percent).toFixed(2));
      if (percent < 100) {
        this.progressPercent = percent;
      }
    })).subscribe({
      next: response => {
        allData = allData.concat(response.items);
      }, error: (error) => {
        console.error(error);
        this.msg.error("导出时出现异常,请稍后重试~");
        this.showProgress = false;
      }, complete: () => {
        this.api.setRowData(allData);
        this.progressPercent = 100;
        this.exportDataAsExcel();
        this.showProgress = false;
        this.refreshRowsData();
      }
    });
  }

  exportDataAsExcel() {
    const columns = this.columnApi.getAllDisplayedColumns().filter(column => {
      return !column.getColId().startsWith("_");
    });
    this.api.exportDataAsExcel({
      columnKeys: columns,
      fileName: this.gridName ? this.gridName : "data",
      sheetName: this.gridName ? this.gridName : "data",

    });

  }

  exportGridStatisticsFooter(): ExcelCell[][] {
    const footer: Array<Array<any>> = [[]];
    if (!this.suppressGridStatisticsBar && this.statistics && this.statistics.length) {
      const statistics = this.statistics.filter(items => items.skipExport !== true)
        .map(items => {
          const rows = [];
          rows.push({
            styleId: "bigHeader",
            data: {
              type: "String",
              value: items.label
            }
          });
          items.data.forEach(item => {
            rows.push({
              styleId: "bigHeader",
              data: {
                type: "String",
                value: `${item.label}:${item.value}`
              }
            });
          });
          return rows;
        });
      footer.push(...statistics);
    }
    return footer;

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
        return
      }
      const value = this.api.getValue(cell.column, node);
      let text = value;
      const colDef = cell.column.getColDef();
      if (typeof colDef.valueFormatter === "string") {
        text = colDef.valueFormatter;
      }
      if (typeof colDef.valueFormatter === "function") {
        const params: ValueFormatterParams = {
          value, node: node, column: cell.column, api: this.api,
          columnApi: this.columnApi, data: node.data, colDef: colDef, context: {}
        }
        text = colDef.valueFormatter(params);
      }
      this.clipboard.copy(text);
      this.api.flashCells({rowNodes: [node], columns: [cell.column]})
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildStatusBar() {
    const statusPanels = [];
    if (this.showDefaultStatusBar) {
      statusPanels.push(...this.defaultStatusPanels);
    }
    if (this.options.statusBar && this.options.statusBar.statusPanels.length) {
      this.options.statusBar.statusPanels.push(...statusPanels);
    } else {
      this.options.statusBar = {statusPanels};
    }
  }

  /**
   * 获取当前排序字段
   * @private
   */
  private getSorts(): { [key: string]: "order" | "asc" } {
    const sort: { [key: string]: "order" | "asc" } = {};
    const columnState = this.columnApi.getColumnState();
    if (!columnState || !columnState.length) {
      return sort;
    }
    columnState
      .filter(state => state.sort)
      .sort(((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0)))
      .forEach(state => {
        if (typeof state.colId === "string") {
          Object.assign(sort, {[state.colId]: (state.sort || "asc").toLowerCase() as string});
        }
      });
    return sort;
  }

  /**
   * 服务端模式从服务端获取数据
   * @param queryParams
   */
  private serverSideData(queryParams: { [key: string]: any }): Observable<Page<any> | null> {
    const complete$ = new Subject<Page<any> | null>();
    const getRows = (params: IServerSideGetRowsParams): void => {
      if (this.treeData) {
        const groupKeys = params.request.groupKeys;
        Object.assign(queryParams, {groupKeys});
      }
      const sort = params.request.sortModel;
      if (sort.length) {
        const orderBys = {};
        sort.forEach(item => {
          Object.assign(orderBys, {[item.colId]: item.sort});
        });
        Object.assign(queryParams, orderBys);
      }
      const startRow = params.request.startRow || 0;
      const endRow = params.request.endRow || 1;
      const pageSize = endRow - startRow;
      const page = startRow / pageSize + 1;
      Object.assign(queryParams, {size: pageSize, current: page});

      this.dataLoading = true;
      this.api.showLoadingOverlay();
      const requestData = this.gridTableConfig.dataParams ? this.gridTableConfig.dataParams({...queryParams}) : {...queryParams};
      this.getData(requestData)
        .pipe(takeUntil(this.destroy$), catchError(err => {
          return of({total: 0, items: [], statistics: []});
        }))
        .subscribe({
          next: response => {
            complete$.next(response);
            this.refreshData.emit(response);
            params.success({rowData: response.items, rowCount: response.total});
            this.statistics = response.statistics || [];
            this.total = response.total;

            if (!response.items.length && !this.treeData) {
              this.api.showNoRowsOverlay();
            } else {
              this.api.hideOverlay();
            }
            this.dataLoading = false;
            this.cdr.detectChanges();
          }, error: err => complete$.error(err)
        });
    };
    this.api.showLoadingOverlay();
    this.api.setServerSideDatasource({getRows});

    return complete$.asObservable().pipe(take(1));
  }

  /**
   * 客户端模式从服务端获取数据
   * @param queryParams
   */
  private serverClientData(queryParams: { [key: string]: any }): Observable<Page<any> | null> {
    const complete$ = new Subject<Page<any> | null>();
    const sorts = this.getSorts();

    if (sorts) {
      Object.assign(queryParams, {
        orderBys: sorts
      });
    }
    if (this.showFooter && this.gridTablePagination) {
      Object.assign(queryParams, {size: this.currentPageSize, current: this.currentPage});
    }

    this.api.showLoadingOverlay();
    if (!this.suppressGridStatisticsRow) {
      this.api.setPinnedBottomRowData([]);
    }
    this.dataLoading = true;

    this.getData(this.gridTableConfig.dataParams ? this.gridTableConfig.dataParams({...queryParams}) : {...queryParams})
      .pipe(takeUntil(this.destroy$), catchError(err => {
        console.error(err);
        return of({total: 0, items: [], statistics: []});
      }))
      .subscribe({
        next: response => {
          this.refreshData.emit(response);
          complete$.next(response);
          this.api.setRowData(response.items);
          this.statistics = response.statistics || [];
          if (!this.suppressGridStatisticsRow && this.statistics.length) {
            this.api.setPinnedBottomRowData(this.statisticsDataToRowData(this.statistics));
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
        }, error: error => complete$.error(error)
      });
    return complete$.asObservable().pipe(take(1));

  }

  /**
   * 数组分片
   * @param items 数组列表
   * @param size 拆分大小
   */
  private arrayPartition<T>(items: Array<T>, size = 3): Array<Array<T>> {
    const init: Array<Array<T>> = [[]];
    return items.reduce(((previousValue, currentValue) => {
      !Array.isArray(previousValue) || previousValue[previousValue.length - 1].length === size ? previousValue.push([currentValue]) : previousValue[previousValue.length - 1].push(currentValue);
      return previousValue;
    }), init);

  }

  /**
   * 初始化进度条
   * 导出|批量删除共用变量
   */
  private initProgress() {
    this.progressPercent = 0;
    this.progressStatus = "normal";

  }
}
