import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IScriptCase,
  margeRunConfig,
  RunConfig,
  SupportBrowserType,
  supportBrowserType,
  transformParams,
} from '@easy-wt/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { CoreService } from '../../core/core.service';
import {
  GridTableReadyEvent,
  NgxGridTableModule,
  RequestData,
  ThemeService,
  UISharedModule,
} from '@easy-wt/ui-shared';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { GridApi, GridOptions } from 'ag-grid-community';

import { of } from 'rxjs';
import { NzResizableModule, NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'easy-wt-case-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzFormModule,
    NzGridModule,
    NzInputModule,
    NzSelectModule,
    UISharedModule,
    ReactiveFormsModule,
    NzCollapseModule,
    NzDividerModule,
    NzSpaceModule,
    NzTagModule,
    NgxGridTableModule,
    NzResizableModule,
    NzAlertModule,
    NzDescriptionsModule,
    NzInputNumberModule,
  ],
  templateUrl: './case-editor.component.html',
  styleUrls: ['./case-editor.component.less'],
})
export class CaseEditorComponent implements OnInit {
  @Input()
  caseId: number | null;

  @Input()
  siblings;

  /**
   * 创建新的用例
   */
  @Input()
  create: boolean;

  paramsNamePattern = /^[\w_]+$/;

  effectRunConfig: RunConfig | null = null;
  getData: RequestData<any, any>;
  lastGridData: Array<unknown> = [];
  gridOptions: GridOptions = {
    getRowId: (node) => node.data.name,
    columnDefs: [
      {
        field: 'name',
        headerName: this.translate.instant('run_config.field.params.name'),
        sort: 'asc',
        sortable: true,
      },
      {
        field: 'value',
        headerName: this.translate.instant('run_config.field.params.value'),
      },
    ],
  };
  boxWidth = 480;
  protected readonly supportBrowserType = supportBrowserType;
  protected isRoot = false;
  protected configPanelActive = true;
  protected runConfigForm = this.fb.group({
    browserType: new FormControl<Array<SupportBrowserType>>(null, {
      validators: [Validators.required, Validators.minLength(1)],
    }),
    retry: new FormControl<number>(null),
    stepRetry: new FormControl<number>(null),
    params: new FormArray([]),
  });
  protected caseForm = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^\S.*\S$/)]],
    directory: [true],
    runConfig: this.runConfigForm,
  });
  protected scriptCase?: Omit<IScriptCase, 'steps'>;
  protected loading = true;
  /**
   * 是否浏览器环境
   */
  private isBrowser = true;
  private gridApi: GridApi;
  private resizeAnimationId: number;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private coreService: CoreService,
    protected theme: ThemeService,
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private modalData: {
      caseId?: number;
      create?: boolean;
      siblings?: boolean;
    }
  ) {
    this.caseId =
      this.modalData && typeof this.modalData.caseId === 'number'
        ? this.modalData.caseId
        : null;
    this.create =
      this.modalData && typeof this.modalData.create === 'boolean'
        ? this.modalData.create
        : true;
    this.siblings =
      this.modalData && typeof this.modalData.siblings === 'boolean'
        ? this.modalData.siblings
        : false;
  }

  ngOnInit(): void {
    if (this.caseId) {
      this.coreService.findAncestorsTree(this.caseId).then((scriptCase) => {
        const { steps, ...other } = scriptCase;
        this.scriptCase = other;
        this.init();
        this.loading = false;
      });
    } else {
      this.init();
      this.loading = false;
    }

    this.getData = () => {
      return of({ items: this.lastGridData, total: this.lastGridData.length });
    };
  }

  onAddParams(i: number, params?: { name: string; value: unknown }) {
    this.runConfigForm.controls.params.insert(
      i + 1,
      new FormGroup({
        name: new FormControl(params?.name, {
          validators: [Validators.pattern(this.paramsNamePattern)],
        }),
        value: new FormControl(params?.value),
      }),
      { emitEvent: true }
    );
  }

  onRemoveParams(i: number) {
    this.runConfigForm.controls.params.removeAt(i);
  }

  async update(): Promise<false | IScriptCase> {
    if (this.caseForm.invalid) {
      this.invalidForm();
      return false;
    }
    const value = this.caseForm.value;
    const scriptCase = Object.assign({ id: this.scriptCase.id }, value);
    const { params, ...other } = value.runConfig;
    const runParams = this.flatRunParams({ params });
    const runConfig = Object.assign(
      { runParams, id: this.scriptCase.runConfig.id },
      other
    );
    scriptCase.runConfig = runConfig;
    const updated = await this.coreService.saveCase(
      transformParams(scriptCase)
    );
    return Object.assign(updated, { directory: this.scriptCase.directory });
  }

  async save(): Promise<IScriptCase | boolean> {
    if (this.caseForm.invalid) {
      this.invalidForm();
      return false;
    }
    const value = this.caseForm.value;
    let parent = null;
    if (this.scriptCase && !this.siblings) {
      //添加下级节点
      parent = this.scriptCase;
    }
    if (this.scriptCase && this.siblings && this.scriptCase.parent != null) {
      //添加平级节点
      parent = this.scriptCase.parent;
    }
    const scriptCase = Object.assign({ parent }, value);
    const { params, ...other } = value.runConfig;
    const runParams = this.flatRunParams({ params });
    const runConfig = Object.assign({ runParams }, other);
    scriptCase.runConfig = transformParams(runConfig);
    return await this.coreService.saveCase(transformParams(scriptCase));
  }

  flatRunParams(runConfig: { params?: Array<any> }): Record<string, unknown> {
    if (runConfig.params && runConfig.params.length) {
      return runConfig.params
        .filter((item) => item.name && this.paramsNamePattern.test(item.name))
        .map((item) => ({ [item.name]: item.value }))
        .reduce((previous, current) => Object.assign(previous, current), {});
    }
    return {};
  }

  invalidForm() {
    Object.values(this.runConfigForm.controls).forEach((control) => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
    Object.values(this.caseForm.controls).forEach((control) => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }

  onGridReady($event: GridTableReadyEvent) {
    this.gridApi = $event.event.api;
    this.gridApi.sizeColumnsToFit();
  }

  onResize($event: NzResizeEvent) {
    cancelAnimationFrame(this.resizeAnimationId);
    this.resizeAnimationId = requestAnimationFrame(() => {
      this.boxWidth = $event.width;
    });
  }

  private init() {
    this.runConfigForm.valueChanges.subscribe((value) => {
      const { params, ...other } = value;
      const runParams = this.flatRunParams({ params });
      let config: Partial<RunConfig> = Object.assign({ runParams }, other);
      if (this.scriptCase) {
        if (this.create) {
          if (this.siblings) {
            //如果是创建兄弟节点用例,那么应该合并他们的父级配置和当前配置
            config = margeRunConfig(this.scriptCase.parent, config);
          } else {
            //如果创建下级节点,合并选择的节点和当前配置
            config = margeRunConfig(this.scriptCase, config);
          }
        } else {
          //如果是修改用例,那么应该合并他们的父级配置和当前配置
          config = margeRunConfig(this.scriptCase.parent, config);
        }
      }
      this.effectRunConfig = config;
      const data = Object.keys(config.runParams).map((key) => {
        return { name: key, value: config.runParams[key] };
      });
      this.lastGridData = data;
      if (this.gridApi) {
        this.gridApi.setRowData(data);
      }
    });
    if (this.create) {
      this.caseForm.reset({ directory: false });
      this.caseForm.controls.directory.enable();
      //是否添加根节点
      this.isRoot = !(
        (this.scriptCase && !this.siblings) ||
        (this.scriptCase && this.siblings && this.scriptCase.parent != null)
      );
      this.updateControlValidator(this.isRoot);
    } else {
      this.caseForm.reset(this.scriptCase);
      if (
        this.scriptCase &&
        this.scriptCase.runConfig &&
        this.scriptCase.runConfig.runParams
      ) {
        const runParams = this.scriptCase.runConfig.runParams;
        Object.keys(runParams)
          .filter((key) => !!key)
          .forEach((key, index) => {
            this.onAddParams(index, { name: key, value: runParams[key] });
          });
      }
      this.caseForm.controls.directory.disable();
      this.isRoot = this.scriptCase.parent === null;
      this.updateControlValidator(this.isRoot);
    }
  }

  /**
   * 根据是否顶级节点更新表单需要验证的项目
   * @param isRoot 是否顶级节点
   */
  private updateControlValidator(isRoot: boolean) {
    const browserTypeControl = this.runConfigForm.controls.browserType;
    if (isRoot) {
      browserTypeControl.setValidators(Validators.required);
    } else {
      browserTypeControl.clearValidators();
      browserTypeControl.markAsPristine();
    }
  }
}
