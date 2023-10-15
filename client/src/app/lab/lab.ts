import { NumericalOperationsComponent } from './numerical-operations/numerical-operations.component';
import { NewtonsMethodComponent } from './newtons-method/newtons-method.component';
import { ComponentType } from '@angular/cdk/overlay';
import { SimpleIterationComponent } from '@lab/simple-iteration/simple-iteration.component';

export interface Lab {
  name: string;
  description: string;
  clientUrl: string;
  apiUrl: string;
  component: ComponentType<unknown>;
}

export interface LabComponentData {
  lab: Lab;
}

export const LABS: Lab[] = [
  {
    name: 'Numerical Operations',
    description: 'Perform numerical operations on two numbers.',
    clientUrl: 'numerical-operations',
    apiUrl: 'numerical_operations',
    component: NumericalOperationsComponent,
  },
  {
    name: "Newton's Method",
    description: "Find the root of a function using Newton's Method.",
    clientUrl: 'newtons-method',
    apiUrl: 'newtons_method',
    component: NewtonsMethodComponent,
  },
  {
    name: 'Simple Iteration Method',
    description: 'Find the root of a function using the Simple Iteration Method.',
    clientUrl: 'simple-iteration',
    apiUrl: 'simple_iteration',
    component: SimpleIterationComponent,
  },
];
