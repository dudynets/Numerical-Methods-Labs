import { NewtonsMethodComponent } from '@lab/non-linear/newtons-method/newtons-method.component';
import { ComponentType } from '@angular/cdk/overlay';
import { FixedPointIterationMethodComponent } from '@lab/non-linear/fixed-point-iteration-method/fixed-point-iteration-method.component';
import { SecantMethodComponent } from '@lab/non-linear/secant-method/secant-method.component';
import { GaussianEliminationMethodComponent } from '@lab/systems-of-linear/gaussian-elimination-method/gaussian-elimination-method.component';
import { LeastSquaresMethodComponent } from '@lab/systems-of-linear/least-squares-method/least-squares-method.component';
import { FixedPointIterationSystemMethodComponent } from '@lab/systems-of-linear/fixed-point-iteration-system-method/fixed-point-iteration-system-method.component';
import { NewtonsInterpolationMethodComponent } from '@lab/interpolation/newtons-interpolation-method/newtons-interpolation-method.component';
import { LagrangesInterpolationMethodComponent } from '@lab/interpolation/lagranges-interpolation-method/lagranges-interpolation-method.component';

export interface Lab {
  name: string;
  description: string;
  clientUrl: string;
  apiUrl: string;
  type: LabType;
  component: ComponentType<unknown>;
}

export interface LabComponentData {
  lab: Lab;
}

export enum LabType {
  NonLinearEquation = 'Non-Linear Equation',
  SystemOfLinearEquations = 'System of Linear Equations',
  Interpolation = 'Interpolation',
}

export interface LabGroup {
  type: LabType;
  labs: Lab[];
}

export const LABS_GROUPS_ORDER: LabType[] = [
  LabType.NonLinearEquation,
  LabType.SystemOfLinearEquations,
  LabType.Interpolation,
];

export const LABS: Lab[] = [
  {
    name: "Newton's Method",
    description: "Find the root of the equation using Newton's Method.",
    clientUrl: 'newtons-method',
    apiUrl: 'newtons_method',
    type: LabType.NonLinearEquation,
    component: NewtonsMethodComponent,
  },
  {
    name: 'Secant Method',
    description: 'Find the root of the equation using the Secant Method.',
    clientUrl: 'secant-method',
    apiUrl: 'secant_method',
    type: LabType.NonLinearEquation,
    component: SecantMethodComponent,
  },
  {
    name: 'Fixed-Point Iteration Method',
    description: 'Find the root of the equation using the Fixed-Point Iteration Method.',
    clientUrl: 'fixed-point-iteration-method',
    apiUrl: 'fixed_point_iteration_method',
    type: LabType.NonLinearEquation,
    component: FixedPointIterationMethodComponent,
  },
  {
    name: 'Gaussian Elimination Method',
    description: 'Solve a system of linear equations using the Gaussian Elimination Method.',
    clientUrl: 'gaussian-elimination-method',
    apiUrl: 'gaussian_elimination_method',
    type: LabType.SystemOfLinearEquations,
    component: GaussianEliminationMethodComponent,
  },
  {
    name: 'Least Squares Method',
    description: 'Solve a system of linear equations using the Least Squares Method.',
    clientUrl: 'least-squares-method',
    apiUrl: 'least_squares_method',
    type: LabType.SystemOfLinearEquations,
    component: LeastSquaresMethodComponent,
  },
  {
    name: 'Fixed Point Iteration Method',
    description: 'Solve a system of linear equations using the Fixed Point Iteration Method.',
    clientUrl: 'fixed-point-iteration-system-method',
    apiUrl: 'fixed_point_iteration_system_method',
    type: LabType.SystemOfLinearEquations,
    component: FixedPointIterationSystemMethodComponent,
  },
  {
    name: "Newton's Interpolation Method",
    description: "Plot a polynomial using Newton's Interpolation Method.",
    clientUrl: 'newtons-interpolation-method',
    apiUrl: 'newtons_interpolation_method',
    type: LabType.Interpolation,
    component: NewtonsInterpolationMethodComponent,
  },
  {
    name: "Lagrange's Interpolation Method",
    description: "Plot a polynomial using Lagrange's Interpolation Method.",
    clientUrl: 'lagranges-interpolation-method',
    apiUrl: 'lagranges_interpolation_method',
    type: LabType.Interpolation,
    component: LagrangesInterpolationMethodComponent,
  },
];
