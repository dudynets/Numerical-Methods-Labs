import { HttpService } from '@core/services/http.service';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { map, Observable } from 'rxjs';

export class ExpressionValidator {
  static createValidator(httpService: HttpService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return httpService
        .validateExpression(control.value)
        .pipe(map((result: boolean) => (result ? null : { invalidExpression: true })));
    };
  }
}
