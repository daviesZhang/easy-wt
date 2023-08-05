import {
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  Type,
  ViewChild,
} from '@angular/core';
import { Observable, of, Subject, take } from 'rxjs';
import { GridApi, GridOptions, ValueFormatterParams } from 'ag-grid-community';

import { IStep, Report, StepResultData } from '@easy-wt/common';

import { DatePipe, DOCUMENT } from '@angular/common';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzImageService } from 'ng-zorro-antd/image';

import { optionsComponentSelector } from '../../options-component-utils';
import {
  NzResizableModule,
  NzResizeDirection,
  NzResizeEvent,
} from 'ng-zorro-antd/resizable';
import { TranslateService } from '@ngx-translate/core';
import { NgxGridTableModule } from '../../ngx-grid-table.module';
import { UISharedModule } from '../../ui-shared.module';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { OptionParams } from '../../components/abstract-options';
import { SelectorLocatorComponent } from '../../components/selector-locator/selector-locator.component';
import {
  GridTableComponent,
  GridTableReadyEvent,
  RequestData,
} from '../../grid-table/grid-table/grid-table.component';
import { TemplateRendererComponent } from '../../grid-table/template-renderer/template-renderer.component';
import { ThemeService } from '../../service/theme.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'easy-wt-report',
  templateUrl: './report.component.html',
  standalone: true,
  imports: [
    UISharedModule,
    NgxGridTableModule,
    NzPageHeaderModule,
    NzTagModule,
    NzSpaceModule,
    NzDescriptionsModule,
    NzStatisticModule,
    NzResizableModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    NzCollapseModule,
    NzPopoverModule,
  ],
  styleUrls: ['./report.component.less'],
})
export class ReportComponent implements OnInit, OnDestroy {
  report: Report | null = null;

  gridApi: GridApi;

  options: GridOptions;

  getData: RequestData<any, any>;

  table!: GridTableComponent;

  datePipe = new DatePipe('zh-CN');

  @ViewChild('rowButtonTemplate', { static: true })
  rowButtonTemplate!: TemplateRef<NzSafeAny>;

  @ViewChild('resultTemplate', { static: true })
  resultTemplate!: TemplateRef<NzSafeAny>;

  @Input({ required: true })
  reportData: Observable<Report | any>;

  @Input()
  windowName: string;

  @Input()
  exportPDF: () => void;

  @Input()
  exportHTML: () => void;

  @Input()
  forPDF = false;

  domLayout: 'autoHeight' | 'print' = 'autoHeight';
  images: Array<{
    src: string;
    data?: StepResultData;
    active: boolean;
    component: Type<any>;
    params: OptionParams<any>;
    step: IStep;
    type: string;
  }> = null;

  video: string;
  videoHeight: number;
  videoWidth: number;

  localHTML = false;
  resizeId = -1;

  destroy$ = new Subject();

  resizeDirection: NzResizeDirection | null = null;

  gridTheme: string;

  constructor(
    private inj: Injector,
    private translate: TranslateService,
    protected themeService: ThemeService,
    protected changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private _doc: Document,
    private nzImageService: NzImageService
  ) {
    if (!this.getElectron() && this.getWindow().location.protocol === 'file:') {
      this.localHTML = true;
    }
  }

  getWindow(): Window | null {
    return this._doc.defaultView;
  }

  getElectron() {
    return this.getWindow()['electron'];
  }

  ngOnInit(): void {
    this.themeService.currentGridTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((next) => {
        this.gridTheme = next;
        this.changeDetectorRef.detectChanges();
      });
    this.reportData.pipe(take(1)).subscribe((next) => {
      this.report = next;
      this.images = this.report.actions
        .filter((action) => this.hasImage(action))
        .map((action) => {
          const component = optionsComponentSelector(action.step.type)
            .component as Type<any>;
          return {
            src: this.mediaProtocol(action.data.screenshot as string),
            step: action.step,
            data: action.data,
            active: true,
            component: component,
            params: { renderer: true, value: action.step.options },
            type: this.translate.instant(
              `step.type_options.${action.step.type}`.toLowerCase()
            ),
          };
        });
    });
    this.getData = (params) => {
      return of({
        total: this.report.actions.length,
        items: this.report.actions,
      });
    };
    this.domLayout = this.forPDF ? 'print' : 'autoHeight';
    this.options = {
      getRowId: (params) => params.data.step.id.toString(),
      columnDefs: [
        {
          headerName: this.translate.instant('step.field.name'),
          field: 'step.name',
          cellRenderer: TemplateRendererComponent,
          cellRendererParams: {
            ngTemplate: this.rowButtonTemplate,
          },

          onCellDoubleClicked: (event) => {
            if (this.hasImage(event.node.data)) {
              this.showImages(event.node.data.data.screenshot);
            }
          },
        },
        {
          headerName: this.translate.instant('report.field.count'),
          field: 'count',
          type: 'numericColumn',
          width: 90,
        },

        {
          headerName: this.translate.instant('step.field.type'),
          field: 'step.type',
          valueFormatter: (params) =>
            this.translate.instant(
              `step.type_options.${params.value}`.toLowerCase()
            ),
          width: 130,
        },
        {
          headerName: this.translate.instant('report.field.success'),
          field: 'success',
          cellDataType: false,
          cellClassRules: {
            'skip-row': (params) => !params.data.begin,
            'failure-row': (params) => params.data.success === false,
          },
          cellRenderer: TemplateRendererComponent,
          cellRendererParams: {
            ngTemplate: this.resultTemplate,
          },
          valueFormatter: (params) => {
            if (!params.data.begin) {
              return this.translate.instant(
                !params.data.step.enable
                  ? 'report.disable_step'
                  : 'report.skip_step'
              );
            }
            return `${this.translate.instant(
              'report.field.success_' + params.value
            )}(${((params.data.end - params.data.begin) / 1000).toFixed(2)}s)`;
          },
          width: 90,
        },

        {
          hide: this.domLayout === 'print',
          headerName: this.translate.instant('step.field.options'),
          field: 'step.options',
          valueFormatter: null,
          cellRendererParams: { renderer: true },
          cellRendererSelector: (params) =>
            optionsComponentSelector(params.data.step.type),
        },
        {
          headerName: this.translate.instant('step.field.expression'),
          field: 'step.expression',
        },
        {
          hide: this.domLayout == 'print',
          headerName: this.translate.instant('step.field.selector'),
          field: 'step.selector',
          cellRendererParams: { renderer: true },
          cellRenderer: SelectorLocatorComponent,
        },
        {
          hide: this.domLayout == 'print',
          headerName: this.translate.instant('common.begin_time'),
          field: 'begin',
          width: 165,
          valueFormatter: this.dateFormatter.bind(this),
        },
        {
          hide: this.domLayout == 'print',
          headerName: this.translate.instant('common.end_time'),
          field: 'end',
          width: 165,
          valueFormatter: this.dateFormatter.bind(this),
        },
        {
          hide: this.domLayout == 'print',
          headerName: this.translate.instant('step.field.desc'),
          field: 'step.desc',
        },
      ],
    };
  }

  createInjector(params) {
    return Injector.create({
      providers: [{ provide: OptionParams, useValue: params }],
      parent: this.inj,
    });
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
    this.gridApi.setDomLayout(this.domLayout);
  }

  hasImage(action) {
    return (
      action &&
      action.data &&
      action.data.screenshot &&
      action.data.screenshot.endsWith('.png')
    );
  }

  mediaProtocol(path: string) {
    if (path.startsWith('/') && !path.startsWith('//')) {
      return `file://${path}`;
    }
    return path;
  }

  showImages(src?: string) {
    const ref = this.nzImageService.preview(this.images, {
      nzZoom: 0.8,
      nzRotate: 0,
    });
    if (src) {
      const index = this.images.findIndex((value) => value.src.endsWith(src));
      if (index >= 0) {
        ref.switchTo(index);
      }
    }
  }

  playVideo(data) {
    if (this.localHTML) {
      this.getWindow().open(data.data.video);
    } else {
      this.video = this.mediaProtocol(data.data.video);
    }
  }

  onVideoClose() {
    this.video = null;
  }

  onResize({ width, height, direction }: NzResizeEvent): void {
    cancelAnimationFrame(this.resizeId);
    this.resizeId = requestAnimationFrame(() => {
      this.videoWidth = width;
      this.videoHeight = height;
      this.resizeDirection = direction;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
