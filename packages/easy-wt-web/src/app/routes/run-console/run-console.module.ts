import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RunConsoleRoutingModule } from './run-console-routing.module';
import { NgxGridTableModule, UISharedModule } from '@easy-wt/ui-shared';
import { ConsoleComponent } from './console/console.component';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { GridHeaderComponent } from './grid-header/grid-header.component';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { MessageRendererComponent } from './message-renderer/message-renderer.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

@NgModule({
  declarations: [
    ConsoleComponent,
    GridHeaderComponent,
    MessageRendererComponent,
  ],
  imports: [
    CommonModule,
    UISharedModule,
    RunConsoleRoutingModule,
    CdkVirtualScrollViewport,
    NzListModule,
    NzSkeletonModule,
    NgxGridTableModule,
    CdkVirtualForOf,
    CdkFixedSizeVirtualScroll,
    NzSpaceModule,
    NzTagModule,
    NzSwitchModule,
  ],
})
export class RunConsoleModule {}
