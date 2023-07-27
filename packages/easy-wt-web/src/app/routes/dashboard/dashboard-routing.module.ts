import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportChartComponent } from './report-chart/report-chart.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ReportChartComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
