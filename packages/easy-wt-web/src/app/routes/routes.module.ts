import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteRoutingModule } from './routes-routing.module';
import { ReportModule } from './report/report.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, ReportModule, RouteRoutingModule],
})
export class RoutesModule {}
