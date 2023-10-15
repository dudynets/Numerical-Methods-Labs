import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LabComponent } from './lab.component';
import { canActivateLabGuard } from '../core/guards/can-activate-lab.guard';
import { LABS } from '@lab/lab';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: LABS[0].clientUrl,
  },
  {
    path: ':labId',
    canActivate: [canActivateLabGuard],
    component: LabComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LabRoutingModule {}
