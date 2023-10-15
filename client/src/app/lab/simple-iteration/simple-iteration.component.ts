import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { ServerSelectors } from '@core/state/server/server.selectors';
import { Observable, take } from 'rxjs';
import { LabSnapshot } from '@core/state/labs/labs.model';
import { HttpService } from '@core/services/http.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ExpressionValidator } from '@core/validators/expression.validator';
import { greaterThanValidator } from '@core/validators/greater-than.validator';
import { Lab, LabComponentData } from '@lab/lab';
import { LAB_COMPONENT_DATA } from '@lab/lab.component';
import { LabsSelectors } from '@core/state/labs/labs.selectors';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CalculateLabOutput, UpdateLabInput } from '@core/state/labs/labs.actions';
import { ServerTaskState } from '@nml/core/state/server/server.model';

@UntilDestroy()
@Component({
  selector: 'nml-simple-iteration',
  templateUrl: './simple-iteration.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleIterationComponent implements OnInit {
  @Select(ServerSelectors.canRunTask)
  canRunTask$!: Observable<boolean>;

  @Select(ServerSelectors.getServerTaskState)
  serverTaskState$!: Observable<ServerTaskState | null>;

  labSnapshot$!: Observable<LabSnapshot | null>;

  protected readonly ServerTaskState = ServerTaskState;
  private readonly httpService = inject(HttpService);

  inputForm: FormGroup = new FormGroup({
    f_string: new FormControl<string | null>(
      null,
      [Validators.required],
      [ExpressionValidator.createValidator(this.httpService)],
    ),
    x0: new FormControl<number | null>(null, [Validators.required]),
    tol: new FormControl<number | null>(1e-6, [greaterThanValidator(0)]),
    max_iter: new FormControl<number | null>(100, [Validators.min(1)]),
  });

  private readonly store = inject(Store);
  private readonly componentData: LabComponentData = inject<LabComponentData>(LAB_COMPONENT_DATA);

  get lab(): Lab {
    return this.componentData.lab;
  }

  get fString(): FormControl<string | null> {
    return this.inputForm.get('f_string') as FormControl<string>;
  }

  get x0(): FormControl<number | null> {
    return this.inputForm.get('x0') as FormControl<number>;
  }

  get tol(): FormControl<number | null> {
    return this.inputForm.get('tol') as FormControl<number>;
  }

  get maxIter(): FormControl<number | null> {
    return this.inputForm.get('max_iter') as FormControl<number>;
  }

  ngOnInit(): void {
    this.labSnapshot$ = this.store.select(LabsSelectors.getLabSnapshot(this.lab.clientUrl));

    this.labSnapshot$.pipe(untilDestroyed(this), take(1)).subscribe((labSnapshot: LabSnapshot | null) => {
      this.inputForm.setValue(
        {
          f_string: labSnapshot?.input?.['f_string'] ?? null,
          x0: labSnapshot?.input?.['x0'] ?? null,
          tol: labSnapshot?.input?.['tol'] ?? 1e-6,
          max_iter: labSnapshot?.input?.['max_iter'] ?? 100,
        },
        { emitEvent: false },
      );
    });

    this.inputForm.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      this.fString.setValue(
        value.f_string
          ?.toString()
          .replace(/,/g, '.')
          .replace(/\s/g, '')
          .replace(/\.{2,}/g, '.'),
        { emitEvent: false },
      );
      this.store.dispatch(new UpdateLabInput(this.lab, value));
    });
  }

  submit(): void {
    if (!this.inputForm.valid) return;
    if (!this.tol.value) this.tol.setValue(1e-6, { emitEvent: false });
    if (!this.maxIter.value) this.maxIter.setValue(100, { emitEvent: false });
    this.store.dispatch(new CalculateLabOutput(this.lab));
  }
}
