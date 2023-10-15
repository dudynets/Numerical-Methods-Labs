import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function greaterThanValidator(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === undefined || control.value === null) return null;
    return control.value > min ? null : { greaterThan: { value: control.value } };
  };
}
