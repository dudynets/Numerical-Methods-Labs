import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LabRoutingModule } from './lab-routing.module';
import { LabComponent } from './lab.component';
import { PortalModule } from '@angular/cdk/portal';
import { NewtonsMethodComponent } from '@lab/non-linear/newtons-method/newtons-method.component';
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
import { FixedPointIterationMethodComponent } from '@lab/non-linear/fixed-point-iteration-method/fixed-point-iteration-method.component';
import { SecantMethodComponent } from '@lab/non-linear/secant-method/secant-method.component';
import { GaussianEliminationMethodComponent } from '@lab/systems-of-linear/gaussian-elimination-method/gaussian-elimination-method.component';
import { CurlyBracketsWrapperModule } from '@core/components/curly-brackets-wrapper/curly-brackets-wrapper.module';
import { LeastSquaresMethodComponent } from '@lab/systems-of-linear/least-squares-method/least-squares-method.component';
import { FixedPointIterationSystemMethodComponent } from './systems-of-linear/fixed-point-iteration-system-method/fixed-point-iteration-system-method.component';
import { NewtonsInterpolationMethodComponent } from './interpolation/newtons-interpolation-method/newtons-interpolation-method.component';
import { LagrangesInterpolationMethodComponent } from '@lab/interpolation/lagranges-interpolation-method/lagranges-interpolation-method.component';
import { RectanglesRuleComponent } from '@lab/integration/rectangles-rule/rectangles-rule.component';
import { TrapezoidalRuleComponent } from './integration/trapezoidal-rule/trapezoidal-rule.component';
import { SimpsonsRuleComponent } from './integration/simpsons-rule/simpsons-rule.component';

const LAB_COMPONENTS = [
  NewtonsMethodComponent,
  FixedPointIterationMethodComponent,
  SecantMethodComponent,
  GaussianEliminationMethodComponent,
  LeastSquaresMethodComponent,
  FixedPointIterationSystemMethodComponent,
  NewtonsInterpolationMethodComponent,
  LagrangesInterpolationMethodComponent,
  RectanglesRuleComponent,
  TrapezoidalRuleComponent,
  SimpsonsRuleComponent,
];

@NgModule({
  declarations: [
    LabComponent,
    ...LAB_COMPONENTS,
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
    CurlyBracketsWrapperModule,
  ],
  exports: [],
})
export class LabModule {}
