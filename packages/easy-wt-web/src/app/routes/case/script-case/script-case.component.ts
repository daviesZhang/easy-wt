import {
  ChangeDetectorRef,
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
  IScriptCase,
  IStep,
  Report,
  step,
  STEP_CONFIG,
  StepType,
} from '@easy-wt/common';
import { CoreService } from '../../../core/core.service';
import { from, map, merge, Subject, takeUntil } from 'rxjs';
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
  GridSimpleRendererComponent,
  GridTableComponent,
  GridTableReadyEvent,
  optionsComponentSelector,
  RequestData,
  SelectorLocatorComponent,
  StepSelectComponent,
  TemplateRendererComponent,
  ThemeService,
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

  options: GridOptions<step>;

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

  caseRunCount = 0;

  runningStep: CaseStepEvent | null = null;

  constructor(
    private coreService: CoreService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    protected themeService: ThemeService,
    private modal: NzModalService
  ) {}

  onSelectCase(id: number) {
    if (this.caseId !== null && this.caseId !== id) {
      this.caseId = id;
      this.table.searchRowsData();
      this.runningStep = null;
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
          node.data.sort = index;
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
          sortable: false,
          width: 118,
          colId: 'action',
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
          cellRenderer: GridSimpleRendererComponent,
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
                STEP_CONFIG[params.newValue]['options']
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
          cellRenderer: GridSimpleRendererComponent,
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
          cellRenderer: GridSimpleRendererComponent,
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

    const caseEnd = this.coreService.eventObservable<Report>(
      CaseEvent.CASE_END
    );
    const caseErr = this.coreService.eventObservable<{ uuid: string }>(
      CaseEvent.CASE_ERROR
    );

    merge(caseEnd, caseErr)
      .pipe(takeUntil(this.destroy$))
      .subscribe((next) => {
        this.caseRunCount = 0;
        this.runningStep = null;
        this.gridApi.deselectAll();
      });
  }

  /**
   * 根据步骤类型和配置,返回单元格是否可以编辑
   * @param node
   * @param key
   */
  editableCallback(
    node: IRowNode<IStep>,
    key: 'selector' | 'expression'
  ): boolean {
    if (!node.data) {
      return false;
    }
    const type = node.data.type;
    if (type === null) {
      return false;
    }
    const config = STEP_CONFIG[type];
    if (config) {
      const value = config[key];
      return value && value.edit;
    }
    return false;
  }

  onStepEnd(event: CaseStepEvent) {
    if (this.caseId === event.step.caseId) {
      this.runningStep = null;
      const row = this.gridApi.getRowNode(event.step.id.toString());
      row.setSelected(false);
    }
  }

  onStepStart(event: CaseStepEvent) {
    if (this.caseId === event.step.caseId) {
      this.caseRunCount = event.caseRunCount || 0;
      this.runningStep = event;
      this.cdr.detectChanges();
      const row = this.gridApi.getRowNode(event.step.id.toString());
      row.setSelected(true);
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
    try {
      if (JSON.stringify(event.newValue) === JSON.stringify(event.oldValue)) {
        return;
      }
    } catch (e) {
      //
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
