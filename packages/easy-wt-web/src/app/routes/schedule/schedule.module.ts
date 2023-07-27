import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScheduleRoutingModule } from './schedule-routing.module';
import { ScheduleListComponent } from './schedule-list/schedule-list.component';
import { NgxGridTableModule } from '@easy-wt/ui-shared';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [ScheduleListComponent],
  imports: [
    CommonModule,
    ScheduleRoutingModule,
    NgxGridTableModule,
    NzButtonModule,
    NzDatePickerModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzToolTipModule,
    NzWaveModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
})
export class ScheduleModule {}
