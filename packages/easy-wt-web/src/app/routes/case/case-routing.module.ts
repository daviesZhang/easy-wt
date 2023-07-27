import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScriptCaseComponent } from './script-case/script-case.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ScriptCaseComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaseRoutingModule {}
