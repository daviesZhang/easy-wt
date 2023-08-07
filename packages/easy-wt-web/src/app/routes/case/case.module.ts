import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CaseRoutingModule } from './case-routing.module';
import { ScriptCaseComponent } from './script-case/script-case.component';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

import { NgxGridTableModule, UISharedModule } from '@easy-wt/ui-shared';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { MenuTreeComponent } from '../../components/menu-tree/menu-tree.component';
import { CreateCaseScheduleComponent } from '../../components/create-case-schedule/create-case-schedule.component';

@NgModule({
  declarations: [ScriptCaseComponent],
  imports: [
    CommonModule,
    CaseRoutingModule,
    NzInputNumberModule,
    NzToolTipModule,
    NgxGridTableModule,
    UISharedModule,
    MenuTreeComponent,
    NzResizableModule,

    NzEmptyModule,
    NzSwitchModule,
    NzDropDownModule,
    NzTagModule,
    CreateCaseScheduleComponent,
  ],
})
export class CaseModule {}
