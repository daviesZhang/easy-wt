import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { ReportChartComponent } from './report-chart/report-chart.component';

@NgModule({
  declarations: [ReportChartComponent],
  imports: [CommonModule, DashboardRoutingModule],
})
export class DashboardModule {}
