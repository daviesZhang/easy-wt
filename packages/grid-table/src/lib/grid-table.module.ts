import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GridTableComponent} from './grid-table/grid-table.component';
import {GridTableI18nPipe} from "./grid-table-i18n.pipe";
import {TemplateRendererComponent} from './template-renderer/template-renderer.component';
import {LoadingOverlayComponent} from './loading-overlay/loading-overlay.component';
import {RefreshButtonComponent} from "./refresh-button/refresh-button.component";

import {StatisticsBarComponent} from './statistics-bar/statistics-bar.component';
import {EmptyOverlayComponent} from './empty-overlay/empty-overlay.component';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {NzProgressModule} from 'ng-zorro-antd/progress';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzPaginationModule} from "ng-zorro-antd/pagination";
import {NzPopconfirmModule} from "ng-zorro-antd/popconfirm";
import {AgGridModule} from 'ag-grid-angular';
import {GRID_TABLE_CONFIG, GridTableConfig} from './ngx-grid-table-config';
import {NzMessageModule} from "ng-zorro-antd/message";
import {NzEmptyModule} from "ng-zorro-antd/empty";
import {ClipboardModule} from '@angular/cdk/clipboard';

@NgModule({
  imports: [NzButtonModule,
    CommonModule,
    NzModalModule,
    NzProgressModule,
    NzIconModule,
    NzPopconfirmModule,
    NzMessageModule,
    NzPaginationModule,
    ClipboardModule,
    AgGridModule, NzEmptyModule],
  declarations: [GridTableComponent,
    LoadingOverlayComponent,
    EmptyOverlayComponent,
    StatisticsBarComponent,
    RefreshButtonComponent,
    TemplateRendererComponent,
    GridTableI18nPipe],
  exports: [GridTableComponent, TemplateRendererComponent],
})
export class GridTableModule {

  static forRoot(config: GridTableConfig): ModuleWithProviders<GridTableModule> {

    return {
      ngModule: GridTableModule,
      providers: [{
        provide: GRID_TABLE_CONFIG,
        useValue: config
      }]
    }
  }
}
