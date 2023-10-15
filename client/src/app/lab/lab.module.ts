import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LabRoutingModule } from './lab-routing.module';
import { LabComponent } from './lab.component';
import { PortalModule } from '@angular/cdk/portal';
import { NumericalOperationsComponent } from './numerical-operations/numerical-operations.component';
import { NewtonsMethodComponent } from './newtons-method/newtons-method.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { LabOutputModule } from '@core/components/lab-output/lab-output.module';
import { SafePipeModule } from 'safe-pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SimpleIterationComponent } from './simple-iteration/simple-iteration.component';

const LAB_COMPONENTS = [
  NumericalOperationsComponent,
  NewtonsMethodComponent,
];

@NgModule({
  declarations: [
    LabComponent,
    ...LAB_COMPONENTS,
    SimpleIterationComponent,
  ],
  imports: [
    CommonModule,
    LabRoutingModule,
    PortalModule,
    MatDividerModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    LabOutputModule,
    SafePipeModule,
    MatTooltipModule,
  ],
  exports: [
    NumericalOperationsComponent,
  ],
})
export class LabModule {}
