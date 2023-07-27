import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnvConfigComponent } from './env-config/env-config.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: EnvConfigComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EnvConfigRoutingModule {}
