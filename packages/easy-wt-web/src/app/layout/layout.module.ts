import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultComponent } from './default/default.component';

import { RouterModule } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { UISharedModule } from '@easy-wt/ui-shared';

import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { CaseProgressComponent } from '../components/case-progress/case-progress.component';
import { SettingComponent } from '../components/setting/setting.component';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { LanguageSettingComponent } from '../components/language-setting/language-setting.component';

@NgModule({
  declarations: [DefaultComponent],
  imports: [
    CommonModule,
    RouterModule,
    NzLayoutModule,
    NzMenuModule,
    UISharedModule,
    NzTreeModule,
    NzSwitchModule,
    CaseProgressComponent,
    SettingComponent,
    NzSpaceModule,
    LanguageSettingComponent,
  ],
})
export class LayoutModule {}
