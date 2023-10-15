import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OperationType } from './numerical-operations';
import { Select, Store } from '@ngxs/store';
import { ServerSelectors } from '@core/state/server/server.selectors';
import { Observable, take } from 'rxjs';
import { LabsSelectors } from '@core/state/labs/labs.selectors';
import { LabSnapshot } from '@core/state/labs/labs.model';
import { CalculateLabOutput, UpdateLabInput } from '@core/state/labs/labs.actions';
import { ServerTaskState } from '@core/state/server/server.model';
import { Lab, LabComponentData } from '@lab/lab';
import { LAB_COMPONENT_DATA } from '@lab/lab.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'nml-numerical-operations',
  templateUrl: './numerical-operations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumericalOperationsComponent implements OnInit {
  @Select(ServerSelectors.canRunTask)
  canRunTask$!: Observable<boolean>;

  @Select(ServerSelectors.getServerTaskState)
  serverTaskState$!: Observable<ServerTaskState | null>;

  labSnapshot$!: Observable<LabSnapshot | null>;

  inputForm: FormGroup = new FormGroup({
    a: new FormControl<number | null>(null, [Validators.required]),
    op: new FormControl<OperationType | null>(null, [Validators.required]),
    b: new FormControl<number | null>(null, [Validators.required]),
  });

  protected readonly OperationType = OperationType;
  protected readonly ServerTaskState = ServerTaskState;

  private readonly store = inject(Store);
  private readonly componentData: LabComponentData = inject<LabComponentData>(LAB_COMPONENT_DATA);

  get lab(): Lab {
    return this.componentData.lab;
  }

  get firstOperand(): FormControl<number | null> {
    return this.inputForm.get('a') as FormControl<number>;
  }

  get operation(): FormControl<OperationType | null> {
    return this.inputForm.get('op') as FormControl<OperationType>;
  }

  get secondOperand(): FormControl<number | null> {
    return this.inputForm.get('b') as FormControl<number>;
  }

  ngOnInit(): void {
    this.labSnapshot$ = this.store.select(LabsSelectors.getLabSnapshot(this.lab.clientUrl));

    this.labSnapshot$.pipe(untilDestroyed(this), take(1)).subscribe((labSnapshot: LabSnapshot | null) => {
      this.inputForm.setValue(
        {
          a: labSnapshot?.input?.['a'] ?? null,
          op: labSnapshot?.input?.['op'] ?? null,
          b: labSnapshot?.input?.['b'] ?? null,
        },
        { emitEvent: false },
      );
    });

    this.inputForm.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      this.store.dispatch(new UpdateLabInput(this.lab, value));
    });
  }

  submit(): void {
    if (!this.inputForm.valid) return;
    this.store.dispatch(new CalculateLabOutput(this.lab));
  }
}
