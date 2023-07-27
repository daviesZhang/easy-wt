import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResultRoutingModule } from './result-routing.module';

import { NgxGridTableModule, UISharedModule } from '@easy-wt/ui-shared';

import { ResultListComponent } from './result-list/result-list.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';

@NgModule({
  declarations: [ResultListComponent],
  imports: [
    CommonModule,
    UISharedModule,
    NgxGridTableModule,
    ResultRoutingModule,
    NzDatePickerModule,
    NzSelectModule,
  ],
})
export class ResultModule {}
