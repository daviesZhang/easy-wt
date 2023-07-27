import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// layout
import { DefaultComponent } from '../layout/default/default.component';
import { ReportPageComponent } from './report/report-page/report-page.component';
import { CaseEditorComponent } from '../components/case-editor/case-editor.component';

const routes: Routes = [
  {
    path: '',
    component: DefaultComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'case' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then(
            (mod) => mod.DashboardModule
          ),
      },
      {
        path: 'case',
        loadChildren: () =>
          import('./case/case.module').then((mod) => mod.CaseModule),
        // component: ScriptCaseComponent
      },
      {
        path: 'result',
        loadChildren: () =>
          import('./result/result.module').then((mod) => mod.ResultModule),
        // component: ResultListComponent
      },
      {
        path: 'schedule',
        loadChildren: () =>
          import('./schedule/schedule.module').then(
            (mod) => mod.ScheduleModule
          ),
        // component: ResultListComponent
      },
    ],
  },
  {
    path: 'config',
    loadChildren: () =>
      import('./env-config/env-config.module').then(
        (mod) => mod.EnvConfigModule
      ),
  },
  {
    path: 'report',
    component: ReportPageComponent,
  },
  // 单页不包裹Layout
  { path: '**', redirectTo: 'exception/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class RouteRoutingModule {}
