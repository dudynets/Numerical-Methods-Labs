import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Select, Store } from '@ngxs/store';
import { ServerSelectors } from '@core/state/server/server.selectors';
import { Observable, take } from 'rxjs';
import { LabSnapshot } from '@core/state/labs/labs.model';
import { HttpService } from '@core/services/http.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ExpressionValidator } from '@core/validators/expression.validator';
import { Lab, LabComponentData } from '@lab/lab';
import { LAB_COMPONENT_DATA } from '@lab/lab.component';
import { LabsSelectors } from '@core/state/labs/labs.selectors';
import { CalculateLabOutput, UpdateLabInput } from '@core/state/labs/labs.actions';
import { ServerTaskState } from '@nml/core/state/server/server.model';
import { RectanglesRuleType } from '@lab/integration/rectangles-rule/rectangles-rule';

const DEFAULT_F_STRING = 'x**2';
const DEFAULT_A = 0;
const DEFAULT_B = 10;
const DEFAULT_RULE_TYPE = RectanglesRuleType.Middle;
const DEFAULT_NUMBER_OF_INTERVAL_PARTITIONS = 10000;

@UntilDestroy()
@Component({
  selector: 'nml-rectangles-rule',
  templateUrl: './rectangles-rule.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RectanglesRuleComponent implements OnInit {
  @Select(ServerSelectors.canRunTask)
  canRunTask$!: Observable<boolean>;

  @Select(ServerSelectors.getServerTaskState)
  serverTaskState$!: Observable<ServerTaskState | null>;

  labSnapshot$!: Observable<LabSnapshot | null>;

  protected readonly ServerTaskState = ServerTaskState;
  private readonly httpService = inject(HttpService);

  inputForm: FormGroup = new FormGroup({
    f_string: new FormControl<string | null>(
      DEFAULT_F_STRING,
      [Validators.required],
      [ExpressionValidator.createValidator(this.httpService)],
    ),
    a: new FormControl<number | null>(DEFAULT_A, [Validators.required]),
    b: new FormControl<number | null>(DEFAULT_B, [Validators.required]),
    rule_type: new FormControl<RectanglesRuleType | null>(DEFAULT_RULE_TYPE, [Validators.required]),
    number_of_interval_partitions: new FormControl<number | null>(DEFAULT_NUMBER_OF_INTERVAL_PARTITIONS, [
      Validators.min(1),
    ]),
  });

  private readonly store = inject(Store);
  private readonly componentData: LabComponentData = inject<LabComponentData>(LAB_COMPONENT_DATA);

  get lab(): Lab {
    return this.componentData.lab;
  }

  get fString(): FormControl<string | null> {
    return this.inputForm.get('f_string') as FormControl<string>;
  }

  get a(): FormControl<number | null> {
    return this.inputForm.get('a') as FormControl<number>;
  }

  get b(): FormControl<number | null> {
    return this.inputForm.get('b') as FormControl<number>;
  }

  get ruleType(): FormControl<RectanglesRuleType | null> {
    return this.inputForm.get('rule_type') as FormControl<RectanglesRuleType>;
  }

  get numberOfIntervalPartitions(): FormControl<number | null> {
    return this.inputForm.get('number_of_interval_partitions') as FormControl<number>;
  }

  ngOnInit(): void {
    this.labSnapshot$ = this.store.select(LabsSelectors.getLabSnapshot(this.lab.clientUrl));

    this.labSnapshot$.pipe(untilDestroyed(this), take(1)).subscribe((labSnapshot: LabSnapshot | null) => {
      this.inputForm.setValue(
        {
          f_string: labSnapshot?.input?.['f_string'] ?? DEFAULT_F_STRING,
          a: labSnapshot?.input?.['a'] ?? DEFAULT_A,
          b: labSnapshot?.input?.['b'] ?? DEFAULT_B,
          rule_type: labSnapshot?.input?.['rule_type'] ?? DEFAULT_RULE_TYPE,
          number_of_interval_partitions:
            labSnapshot?.input?.['number_of_interval_partitions'] ?? DEFAULT_NUMBER_OF_INTERVAL_PARTITIONS,
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
    if (!this.ruleType.value) this.ruleType.setValue(DEFAULT_RULE_TYPE, { emitEvent: false });
    if (!this.numberOfIntervalPartitions.value)
      this.numberOfIntervalPartitions.setValue(DEFAULT_NUMBER_OF_INTERVAL_PARTITIONS, { emitEvent: false });
    this.store.dispatch(new UpdateLabInput(this.lab, this.inputForm.value));
    this.store.dispatch(new CalculateLabOutput(this.lab));
  }

  protected readonly RectanglesRuleType = RectanglesRuleType;
}
