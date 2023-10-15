import { Lab } from '@lab/lab';
import { LabInput } from '@core/state/labs/labs.model';

export class UpdateLabInput {
  static readonly type = '[Labs] Update Lab Input';
  constructor(public lab: Lab, public labInput: LabInput) {}
}

export class CalculateLabOutput {
  static readonly type = '[Labs] Calculate Lab Output';
  constructor(public lab: Lab) {}
}

export class ClearLabOutput {
  static readonly type = '[Labs] Clear Lab Output';
  constructor(public lab: Lab) {}
}
