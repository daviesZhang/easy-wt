import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportPageComponent } from './report-page/report-page.component';
import {
  NgxGridTableModule,
  ReportComponent,
  UISharedModule,
} from '@easy-wt/ui-shared';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';

import { NzImageModule } from 'ng-zorro-antd/image';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';

@NgModule({
  declarations: [ReportPageComponent],
  imports: [
    CommonModule,
    NzImageModule,
    UISharedModule,
    NzLayoutModule,
    NzMenuModule,
    NzPageHeaderModule,
    NzSpaceModule,
    NzDescriptionsModule,
    NzTagModule,
    NzStatisticModule,
    NgxGridTableModule,
    ReportComponent,
    NzCardModule,
    NzCollapseModule,
  ],
})
export class ReportModule {}
