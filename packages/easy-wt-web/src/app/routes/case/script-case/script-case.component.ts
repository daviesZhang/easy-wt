import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  CaseBeginEvent,
  CaseEvent,
  CaseStepEvent,
  DEFAULT_OPTIONS,
  IScriptCase,
  IStep,
  STEP_TYPE_CONFIG,
  StepType,
  StepTypeConfig,
} from '@easy-wt/common';
import { CoreService } from '../../../core/core.service';
import { from, map, Subject, takeUntil } from 'rxjs';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzModalService } from 'ng-zorro-antd/modal';
import {
  CellEditRequestEvent,
  EditableCallbackParams,
  GridApi,
  GridOptions,
  IRowNode,
  RowDragEvent,
  RowNode,
} from 'ag-grid-community';

import {
  expressionComponentSelector,
  GridTableComponent,
  GridTableReadyEvent,
  optionsComponentSelector,
  RequestData,
  SelectorLocatorComponent,
  StepSelectComponent,
  TemplateRendererComponent,
} from '@easy-wt/ui-shared';

import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'easy-wt-script-case',
  templateUrl: './script-case.component.html',
  styleUrls: ['./script-case.component.less'],
})
export class ScriptCaseComponent implements OnInit, OnDestroy {
  scriptCase: IScriptCase | null = null;

  scheduleCaseId: number | null = null;

  showCreateSchedule = false;
  /**
   * 用例ID
   */
  caseId: number | null = null;

  width = 257;

  animationFrameId = -1;

  @ViewChild('rowButtonTemplate', { static: true })
  rowButtonTemplate!: TemplateRef<NzSafeAny>;

  destroy$ = new Subject<void>();

  gridApi: GridApi;

  options: GridOptions;

  getData: RequestData<IStep, unknown>;

  table!: GridTableComponent;

  steps = [];

  runConfig: { delay?: number } = {};

  running = false;
  /**
   * 当前运行的浏览器类型
   */
  runBrowserType: string | null = '';

  stepStatusChangeLoading: { [key: number]: boolean } = {};

  runCount = 0;

  constructor(
    private coreService: CoreService,
    private translate: TranslateService,
    private modal: NzModalService
  ) {}

  onSelectCase(id: number) {
    if (this.caseId !== null && this.caseId !== id) {
      this.caseId = id;
      this.table.searchRowsData();
    } else {
      this.caseId = id;
    }
  }

  onDeleteCase(ids: Array<number>) {
    if (typeof this.caseId === 'number' && ids.indexOf(this.caseId) >= 0) {
      this.caseId = null;
    }
  }

  ngOnInit(): void {
    this.getData = () => {
      return from(this.coreService.findStepByCaseId(this.caseId)).pipe(
        map((next) => {
          this.stepsSort(next);
          return {
            total: next.length,
            items: this.steps,
          };
        })
      );
    };
    this.options = {
      rowClassRules: {
        'disable-row': (params) => !params.data.enable,
      },

      getRowId: (params) => params.data.id.toString(),
      rowDragManaged: true,
      onRowDragEnd: (event: RowDragEvent) => {
        const steps = [];
        event.api.forEachNode((node, index) => {
          const step: IStep = node.data;
          steps.push({ id: step.id, sort: index });
        });
        this.coreService.saveStep(steps, false).then();
      },

      onCellEditingStopped: this.onCellEditRequest.bind(this),

      columnDefs: [
        {
          headerName: this.translate.instant('common.id'),
          field: 'id',
          hide: true,
        },
        {
          headerName: this.translate.instant('common.enable'),
          field: 'enable',
          hide: true,
        },
        {
          headerName: this.translate.instant('common.action'),
          pinned: true,
          field: 'action',
          sortable: false,
          width: 118,
          suppressAutoSize: true,
          suppressCellFlash: true,
          suppressSizeToFit: true,
          editable: false,
          cellRenderer: TemplateRendererComponent,
          cellRendererParams: {
            ngTemplate: this.rowButtonTemplate,
          },
        },
        {
          headerName: this.translate.instant('step.field.name'),
          field: 'name',
          editable: true,
          rowDrag: true,
          cellEditor: 'agTextCellEditor',
        },
        {
          headerName: this.translate.instant('step.field.type'),
          field: 'type',
          valueFormatter: (params) =>
            params.value
              ? this.translate.instant(
                  `step.type_options.${params.value}`.toLowerCase()
                )
              : '',
          cellEditor: StepSelectComponent,
          editable: true,
          cellDataType: false,
          valueSetter: (params) => {
            if (params.data.type !== params.newValue) {
              const options = Object.assign(
                {},
                DEFAULT_OPTIONS[params.newValue]
              );
              params.data.options = options;
              params.node.setDataValue('selector', null);
              params.node.setDataValue('expression', null);
              this.coreService
                .updateStep(params.data.id, {
                  options: options,
                  selector: null,
                  expression: '',
                })
                .then();
            }
            params.data.type = params.newValue;
            return true;
          },
          width: 130,
        },
        {
          headerName: this.translate.instant('step.field.options'),
          field: 'options',
          cellDataType: false,
          equals: (a, b) => JSON.stringify(a) === JSON.stringify(b),
          editable: (params: EditableCallbackParams) =>
            params.data.type !== undefined && params.data.type !== null,
          cellEditorSelector: (params) =>
            optionsComponentSelector(params.data.type),
          cellRendererParams: { renderer: true },
          cellRendererSelector: (params) =>
            optionsComponentSelector(params.data.type),
        },
        {
          headerName: this.translate.instant('step.field.expression'),
          field: 'expression',
          cellDataType: false,
          cellClassRules: {
            'disable-cell': (e) => !e.column.isCellEditable(e.node),
          },
          cellEditorSelector: (params) =>
            expressionComponentSelector(params.data.type),
          editable: (event) => this.editableCallback(event.node, 'expression'),
          valueFormatter: (event) => {
            if (event.data.type === StepType.RUN_SCRIPT) {
              return `<code>`;
            }
            return event.value;
          },
        },
        {
          headerName: this.translate.instant('step.field.selector'),
          field: 'selector',
          cellDataType: false,
          equals: (a, b) => JSON.stringify(a) === JSON.stringify(b),
          cellClassRules: {
            'disable-cell': (e) => !e.column.isCellEditable(e.node),
          },
          cellEditor: SelectorLocatorComponent,
          cellEditorParams: {
            renderer: false,
          },
          minWidth: 130,
          flex: 1,
          cellRenderer: SelectorLocatorComponent,
          cellRendererParams: { renderer: true },
          editable: (event) => this.editableCallback(event.node, 'selector'),
        },
        {
          headerName: this.translate.instant('step.field.desc'),
          field: 'desc',
          editable: true,
          cellEditor: 'agTextCellEditor',
        },
      ],
    };

    this.coreService
      .eventObservable(CaseEvent.STEP_BEGIN)
      .pipe(takeUntil(this.destroy$))
      .subscribe(this.onStepStart.bind(this));

    this.coreService
      .eventObservable(CaseEvent.STEP_END)
      .pipe(takeUntil(this.destroy$))
      .subscribe(this.onStepEnd.bind(this));

    this.coreService
      .eventObservable(CaseEvent.CASE_BEGIN)
      .pipe(takeUntil(this.destroy$))
      .subscribe(this.onCaseStart.bind(this));

    this.coreService
      .eventObservable(CaseEvent.CASE_END)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => (this.runCount = 0));
  }

  /**
   * 根据步骤类型和配置,返回单元格是否可以编辑
   * @param node
   * @param key
   */
  editableCallback(node: IRowNode<IStep>, key: keyof StepTypeConfig): boolean {
    if (!node.data) {
      return false;
    }
    const type = node.data.type;
    if (type === null) {
      return false;
    }
    const config = STEP_TYPE_CONFIG[type];
    return config && config[key].edit;
  }

  onStepEnd(event: CaseStepEvent) {
    //todo 步骤结束的动画或通知
  }

  onStepStart(event: CaseStepEvent) {
    if (this.caseId === event.step.caseId) {
      this.runCount = event.caseRunCount || 0;

      this.gridApi.flashCells({
        rowNodes: [this.gridApi.getRowNode(event.step.id.toString())],
      });
    }
  }

  onCaseStart(event: CaseBeginEvent) {
    if (this.caseId === event.scriptCase.id) {
      this.runBrowserType = event.browserType;
    }
  }

  async onCellEditRequest(event: CellEditRequestEvent) {
    if (event.newValue === undefined) {
      return;
    }
    await this.coreService.updateStep(event.data.id, {
      [event.colDef.field]: event.newValue,
    });
  }

  async run() {
    await this.coreService.executeCase([this.caseId], this.runConfig);
  }

  async deleteStep(id: number) {
    await this.coreService.deleteStep([id]);
    const steps = await this.coreService.findStepByCaseId(this.caseId);
    this.stepsSort(steps);
    this.gridApi.setRowData(this.steps);
    return true;
  }

  deleteConfirm(id: number) {
    this.modal.confirm({
      nzOkText: this.translate.instant('common.delete'),
      nzOkDanger: true,
      nzAutofocus: 'ok',
      nzTitle: this.translate.instant('common.ask_confirm'),
      nzOnOk: () => this.deleteStep(id),
    });
  }

  async addSteps(sort = null) {
    const step = await this.coreService.saveStep([
      {
        caseId: this.caseId,
        sort,
        name: this.translate.instant('step.default_name'),
      },
    ]);
    this.steps = await this.coreService.findStepByCaseId(this.caseId);
    this.stepsSort(this.steps);
    this.gridApi.setRowData(this.steps);
    step.forEach((item) => {
      const rowIndex = this.gridApi.getRowNode(item.id.toString()).rowIndex;
      this.gridApi.startEditingCell({ rowIndex, colKey: 'name' });
    });
  }

  async copySteps(node: RowNode) {
    const data = node.data;
    const newStep = Object.assign({}, data, { id: null, sort: data.sort + 1 });
    delete newStep.id;
    await this.coreService.saveStep([newStep]);
    this.steps = await this.coreService.findStepByCaseId(this.caseId);
    this.stepsSort(this.steps);
    this.gridApi.setRowData(this.steps);
  }

  stepsSort(steps: IStep[]) {
    this.steps = steps.sort((a, b) => a.sort - b.sort);
  }

  onGridReady($event: GridTableReadyEvent) {
    this.gridApi = $event.event.api;
    this.table = $event.gridTable;
  }

  refresh() {
    this.gridApi && this.table.searchRowsData();
  }

  onResize({ width }: NzResizeEvent) {
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame(() => {
      this.width = width;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async stepStatusChange(node: RowNode<IStep>) {
    const id = node.data.id;
    this.stepStatusChangeLoading[id] = true;
    const newValue = !node.data.enable;
    await this.coreService.updateStep(id, { enable: newValue });
    node.setDataValue('enable', newValue);
    const { ...loading } = this.stepStatusChangeLoading;
    delete loading[id];
    this.stepStatusChangeLoading = loading;
  }

  toggleScheduleModal(scheduleCaseId: number | null) {
    this.scheduleCaseId = scheduleCaseId;
    this.showCreateSchedule = !this.showCreateSchedule;
  }
}
