import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Select, Store } from '@ngxs/store';
import { ServerSelectors } from '@core/state/server/server.selectors';
import { Observable, take } from 'rxjs';
import { LabSnapshot } from '@core/state/labs/labs.model';
import { Lab, LabComponentData } from '@lab/lab';
import { LAB_COMPONENT_DATA } from '@lab/lab.component';
import { LabsSelectors } from '@core/state/labs/labs.selectors';
import { CalculateLabOutput, UpdateLabInput } from '@core/state/labs/labs.actions';
import { ServerTaskState } from '@nml/core/state/server/server.model';

const DEFAULT_VECTOR_SIZE = 4;
const DEFAULT_NUMBER_OF_POINTS = 100;
const DEFAULT_X_VALUE = 0;

const getEmptyConstantVector = (): FormControl<number | null>[] => {
  const vector = [];
  for (let i = 0; i < DEFAULT_VECTOR_SIZE; i++) {
    vector.push(new FormControl<number | null>(0, [Validators.required]));
  }
  return vector;
};

@UntilDestroy()
@Component({
  selector: 'nml-lagranges-interpolation-method',
  templateUrl: './lagranges-interpolation-method.component.html',
})
export class LagrangesInterpolationMethodComponent implements OnInit {
  @Select(ServerSelectors.canRunTask)
  canRunTask$!: Observable<boolean>;

  @Select(ServerSelectors.getServerTaskState)
  serverTaskState$!: Observable<ServerTaskState | null>;

  labSnapshot$!: Observable<LabSnapshot | null>;

  protected readonly ServerTaskState = ServerTaskState;

  inputForm: FormGroup = new FormGroup({
    vector_size: new FormControl<number | null>(DEFAULT_VECTOR_SIZE, [Validators.required]),
    x: new FormArray<FormControl<number | null>>(getEmptyConstantVector(), [Validators.required]),
    y: new FormArray<FormControl<number | null>>(getEmptyConstantVector(), [Validators.required]),
    number_of_points: new FormControl<number | null>(DEFAULT_NUMBER_OF_POINTS, [
      Validators.min(2),
    ]),
    x_value: new FormControl<number | null>(DEFAULT_X_VALUE, [Validators.required]),
  });

  private readonly store = inject(Store);
  private readonly componentData: LabComponentData = inject<LabComponentData>(LAB_COMPONENT_DATA);

  get lab(): Lab {
    return this.componentData.lab;
  }

  get vectorSize(): FormControl<number | null> {
    return this.inputForm.get('vector_size') as FormControl<number | null>;
  }

  get x(): FormArray<FormControl<number | null>> {
    return this.inputForm.get('x') as FormArray<FormControl<number | null>>;
  }

  get y(): FormArray<FormControl<number | null>> {
    return this.inputForm.get('y') as FormArray<FormControl<number | null>>;
  }

  get numberOfPoints(): FormControl<number | null> {
    return this.inputForm.get('number_of_points') as FormControl<number | null>;
  }

  get xValue(): FormControl<number | null> {
    return this.inputForm.get('x_value') as FormControl<number | null>;
  }

  get canRemoveRow(): boolean {
    return !!this.vectorSize.value && this.vectorSize.value > 3;
  }

  ngOnInit(): void {
    this.labSnapshot$ = this.store.select(LabsSelectors.getLabSnapshot(this.lab.clientUrl));

    this.labSnapshot$.pipe(untilDestroyed(this), take(1)).subscribe((labSnapshot: LabSnapshot | null) => {
      this.vectorSize.setValue((labSnapshot?.input?.['vector_size'] as number) || DEFAULT_VECTOR_SIZE, {
        emitEvent: false,
      });
      this.numberOfPoints.setValue((labSnapshot?.input?.['number_of_points'] as number) || DEFAULT_NUMBER_OF_POINTS, {
        emitEvent: false,
      });
      this.xValue.setValue((labSnapshot?.input?.['x_value'] as number) || DEFAULT_X_VALUE, {
        emitEvent: false,
      });

      this.rebuildMatrix(
        this.vectorSize.value || DEFAULT_VECTOR_SIZE,
        labSnapshot?.input?.['x'] as (number | null)[],
        labSnapshot?.input?.['y'] as (number | null)[],
      );
    });

    this.inputForm.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      this.store.dispatch(new UpdateLabInput(this.lab, value));
    });

    this.inputForm
      .get('vector_size')
      ?.valueChanges.pipe(untilDestroyed(this))
      .subscribe((value) => {
        const x = this.x.value;
        const y = this.y.value;
        this.rebuildMatrix(value, x, y);
      });
  }

  rebuildMatrix(size: number, x: (number | null)[], y: (number | null)[]): void {
    this.x.clear();
    this.y.clear();

    for (let i = 0; i < size; i++) {
      this.x.push(new FormControl<number | null>(x?.[i] != null ? x?.[i] : null, [Validators.required]));
      this.y.push(new FormControl<number | null>(y?.[i] != null ? y?.[i] : null, [Validators.required]));
    }

    this.store.dispatch(new UpdateLabInput(this.lab, this.inputForm.value));
  }

  randomize(): void {
    const size = this.vectorSize.value;
    if (!size) return;

    const x = this.x.value;
    const y = this.y.value;

    for (let i = 0; i < size; i++) {
      let randomX = 100 - Math.floor(Math.random() * 200);
      while (x.includes(randomX)) {
        randomX = 100 - Math.floor(Math.random() * 200);
      }
      x[i] = randomX;
      y[i] = 100 - Math.floor(Math.random() * 200);
    }

    this.rebuildMatrix(size, x, y);
  }

  addRow(): void {
    const size = this.vectorSize.value;
    if (size) this.vectorSize.setValue(size + 1);
  }

  removeRow(): void {
    const size = this.vectorSize.value;
    if (size && size >= 4) this.vectorSize.setValue(size - 1);
  }

  submit(): void {
    if (!this.inputForm.valid) return;
    if (!this.numberOfPoints.value) this.numberOfPoints.setValue(DEFAULT_NUMBER_OF_POINTS, { emitEvent: false });
    this.store.dispatch(new UpdateLabInput(this.lab, this.inputForm.value));
    this.store.dispatch(
      new CalculateLabOutput(this.lab, {
        json: true,
        skipKeys: ['vector_size'],
      }),
    );
  }
}
