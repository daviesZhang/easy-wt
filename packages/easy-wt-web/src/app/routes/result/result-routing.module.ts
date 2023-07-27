import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ResultListComponent } from './result-list/result-list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ResultListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResultRoutingModule {}
