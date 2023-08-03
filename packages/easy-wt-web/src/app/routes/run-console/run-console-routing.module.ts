import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConsoleComponent } from './console/console.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ConsoleComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RunConsoleRoutingModule {}
