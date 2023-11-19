import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { ServerSelectors } from '@core/state/server/server.selectors';
import { Observable, take } from 'rxjs';
import { LabSnapshot, OutputError } from '@core/state/labs/labs.model';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Lab, LabComponentData } from '@lab/lab';
import { LAB_COMPONENT_DATA } from '@lab/lab.component';
import { LabsSelectors } from '@core/state/labs/labs.selectors';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CalculateLabOutput, UpdateLabInput } from '@core/state/labs/labs.actions';
import { ServerTaskState } from '@core/state/server/server.model';

const DEFAULT_MATRIX_SIZE = 3;

const getEmptyMatrix = (): FormArray<FormControl<number | null>>[] => {
  const matrix = [];
  for (let i = 0; i < DEFAULT_MATRIX_SIZE; i++) {
    const row = new FormArray<FormControl<number | null>>([], [Validators.required]);
    for (let j = 0; j < DEFAULT_MATRIX_SIZE; j++) {
      row.push(new FormControl<number | null>(0, [Validators.required]));
    }
    matrix.push(row);
  }
  return matrix;
};
const getEmptyConstantVector = (): FormControl<number | null>[] => {
  const vector = [];
  for (let i = 0; i < DEFAULT_MATRIX_SIZE; i++) {
    vector.push(new FormControl<number | null>(0, [Validators.required]));
  }
  return vector;
};

@UntilDestroy()
@Component({
  selector: 'nml-gaussian-elimination-method',
  templateUrl: './gaussian-elimination-method.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaussianEliminationMethodComponent implements OnInit {
  @Select(ServerSelectors.canRunTask)
  canRunTask$!: Observable<boolean>;

  @Select(ServerSelectors.getServerTaskState)
  serverTaskState$!: Observable<ServerTaskState | null>;

  labSnapshot$!: Observable<LabSnapshot | null>;

  protected readonly ServerTaskState = ServerTaskState;

  inputForm: FormGroup = new FormGroup({
    matrix_size: new FormControl<number | null>(DEFAULT_MATRIX_SIZE, [Validators.required]),
    coefficient_matrix: new FormArray<FormArray<FormControl<number | null>>>(getEmptyMatrix(), [Validators.required]),
    constants: new FormArray<FormControl<number | null>>(getEmptyConstantVector(), [Validators.required]),
  });

  private readonly store = inject(Store);
  private readonly componentData: LabComponentData = inject<LabComponentData>(LAB_COMPONENT_DATA);

  get lab(): Lab {
    return this.componentData.lab;
  }

  get matrixSize(): FormControl<number | null> {
    return this.inputForm.get('matrix_size') as FormControl<number | null>;
  }

  get coefficientMatrix(): FormArray<FormArray<FormControl<number | null>>> {
    return this.inputForm.get('coefficient_matrix') as FormArray<FormArray<FormControl<number | null>>>;
  }

  get constantVector(): FormArray<FormControl<number | null>> {
    return this.inputForm.get('constants') as FormArray<FormControl<number | null>>;
  }

  get canRemoveRow(): boolean {
    return !!this.matrixSize.value && this.matrixSize.value > 2;
  }

  ngOnInit(): void {
    this.labSnapshot$ = this.store.select(LabsSelectors.getLabSnapshot(this.lab.clientUrl));

    this.labSnapshot$.pipe(untilDestroyed(this), take(1)).subscribe((labSnapshot: LabSnapshot | null) => {
      this.matrixSize.setValue((labSnapshot?.input?.['matrix_size'] as number) || DEFAULT_MATRIX_SIZE, {
        emitEvent: false,
      });

      this.rebuildMatrix(
        this.matrixSize.value || DEFAULT_MATRIX_SIZE,
        labSnapshot?.input?.['coefficient_matrix'] as (number | null)[][],
        labSnapshot?.input?.['constants'] as (number | null)[],
      );
    });

    this.inputForm.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      this.store.dispatch(new UpdateLabInput(this.lab, value));
    });

    this.inputForm
      .get('matrix_size')
      ?.valueChanges.pipe(untilDestroyed(this))
      .subscribe((value) => {
        const coefficientMatrix = this.inputForm.get('coefficient_matrix')?.value as (number | null)[][];
        const constantVector = this.inputForm.get('constants')?.value as (number | null)[];
        this.rebuildMatrix(value, coefficientMatrix, constantVector);
      });
  }

  rebuildMatrix(size: number, coefficientMatrix: (number | null)[][], constantVector: (number | null)[]): void {
    this.coefficientMatrix.clear();
    this.constantVector.clear();

    for (let i = 0; i < size; i++) {
      const row = new FormArray<FormControl<number | null>>([], [Validators.required]);
      for (let j = 0; j < size; j++) {
        row.push(new FormControl<number | null>(null, [Validators.required]));
      }
      this.coefficientMatrix.push(row);
      this.constantVector.push(new FormControl<number | null>(null, [Validators.required]));
    }

    if (!coefficientMatrix || !constantVector) return;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (coefficientMatrix[i] !== undefined && coefficientMatrix[i][j] !== undefined) {
          this.getCoefficientByIndex(i, j).setValue(coefficientMatrix[i][j], { emitEvent: false });
        }
      }

      if (constantVector[i] !== undefined) {
        this.getConstantByIndex(i).setValue(constantVector[i], { emitEvent: false });
      }
    }

    this.store.dispatch(new UpdateLabInput(this.lab, this.inputForm.value));
  }

  randomize(): void {
    const size = this.matrixSize.value;
    if (!size) return;
    const randomMatrix = [];
    const randomVector = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        row.push(Math.floor(Math.random() * 100));
      }
      randomMatrix.push(row);
      randomVector.push(Math.floor(Math.random() * 100));
    }
    this.rebuildMatrix(size, randomMatrix, randomVector);
  }

  getCoefficientByIndex(rowIndex: number, colIndex: number): FormControl<number | null> {
    return this.coefficientMatrix.at(rowIndex).at(colIndex) as FormControl<number>;
  }

  getConstantByIndex(index: number): FormControl<number | null> {
    return this.constantVector.at(index) as FormControl<number>;
  }

  addRow(): void {
    const size = this.matrixSize.value;
    if (size) this.matrixSize.setValue(size + 1);
  }

  removeRow(): void {
    const size = this.matrixSize.value;
    if (size && size >= 3) this.matrixSize.setValue(size - 1);
  }

  getRoots(roots: string | number | boolean | OutputError | undefined): number[] | undefined {
    return roots as number[] | undefined;
  }

  submit(): void {
    if (!this.inputForm.valid) return;
    this.store.dispatch(new UpdateLabInput(this.lab, this.inputForm.value));
    this.store.dispatch(
      new CalculateLabOutput(this.lab, {
        json: true,
        skipKeys: ['matrix_size'],
      }),
    );
  }
}
