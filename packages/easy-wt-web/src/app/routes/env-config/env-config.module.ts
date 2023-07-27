import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnvConfigComponent } from './env-config/env-config.component';
import { EnvConfigRoutingModule } from './env-config-routing.module';
import { UISharedModule } from '@easy-wt/ui-shared';
import { NzSelectModule } from 'ng-zorro-antd/select';

@NgModule({
  declarations: [EnvConfigComponent],
  imports: [
    CommonModule,
    UISharedModule,

    EnvConfigRoutingModule,
    NzSelectModule,
  ],
  exports: [EnvConfigComponent],
})
export class EnvConfigModule {}
