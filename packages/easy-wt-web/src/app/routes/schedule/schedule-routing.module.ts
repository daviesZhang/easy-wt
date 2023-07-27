import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScheduleListComponent } from './schedule-list/schedule-list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ScheduleListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScheduleRoutingModule {}
