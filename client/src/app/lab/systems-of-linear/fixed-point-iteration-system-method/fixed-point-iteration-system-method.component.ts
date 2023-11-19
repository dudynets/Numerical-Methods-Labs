import { Component, inject, OnInit } from '@angular/core';
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
import { greaterThanValidator } from '@core/validators/greater-than.validator';

const DEFAULT_MATRIX_ROWS = 3;
const DEFAULT_MATRIX_COLS = 3;
const DEFAULT_TOL = 1e-6;
const DEFAULT_MAX_ITER = 100;

const getEmptyMatrix = (): FormArray<FormControl<number | null>>[] => {
  const matrix = [];
  for (let i = 0; i < DEFAULT_MATRIX_ROWS; i++) {
    const row = new FormArray<FormControl<number | null>>([], [Validators.required]);
    for (let j = 0; j < DEFAULT_MATRIX_COLS; j++) {
      row.push(new FormControl<number | null>(0, [Validators.required]));
    }
    matrix.push(row);
  }
  return matrix;
};
const getEmptyConstantVector = (): FormControl<number | null>[] => {
  const vector = [];
  for (let i = 0; i < DEFAULT_MATRIX_ROWS; i++) {
    vector.push(new FormControl<number | null>(0, [Validators.required]));
  }
  return vector;
};

@UntilDestroy()
@Component({
  selector: 'nml-fixed-point-iteration-system-method',
  templateUrl: './fixed-point-iteration-system-method.component.html',
})
export class FixedPointIterationSystemMethodComponent implements OnInit {
  @Select(ServerSelectors.canRunTask)
  canRunTask$!: Observable<boolean>;

  @Select(ServerSelectors.getServerTaskState)
  serverTaskState$!: Observable<ServerTaskState | null>;

  labSnapshot$!: Observable<LabSnapshot | null>;

  protected readonly ServerTaskState = ServerTaskState;

  inputForm: FormGroup = new FormGroup({
    matrix_rows: new FormControl<number | null>(DEFAULT_MATRIX_ROWS, [Validators.required]),
    matrix_cols: new FormControl<number | null>(DEFAULT_MATRIX_COLS, [Validators.required]),
    coefficient_matrix: new FormArray<FormArray<FormControl<number | null>>>(getEmptyMatrix(), [Validators.required]),
    constants: new FormArray<FormControl<number | null>>(getEmptyConstantVector(), [Validators.required]),
    tol: new FormControl<number | null>(DEFAULT_TOL, [greaterThanValidator(0)]),
    max_iter: new FormControl<number | null>(DEFAULT_MAX_ITER, [Validators.min(1)]),
  });

  private readonly store = inject(Store);
  private readonly componentData: LabComponentData = inject<LabComponentData>(LAB_COMPONENT_DATA);

  get lab(): Lab {
    return this.componentData.lab;
  }

  get matrixRows(): FormControl<number | null> {
    return this.inputForm.get('matrix_rows') as FormControl<number | null>;
  }

  get matrixCols(): FormControl<number | null> {
    return this.inputForm.get('matrix_cols') as FormControl<number | null>;
  }

  get coefficientMatrix(): FormArray<FormArray<FormControl<number | null>>> {
    return this.inputForm.get('coefficient_matrix') as FormArray<FormArray<FormControl<number | null>>>;
  }

  get constantVector(): FormArray<FormControl<number | null>> {
    return this.inputForm.get('constants') as FormArray<FormControl<number | null>>;
  }

  get tol(): FormControl<number | null> {
    return this.inputForm.get('tol') as FormControl<number>;
  }

  get maxIter(): FormControl<number | null> {
    return this.inputForm.get('max_iter') as FormControl<number>;
  }

  get canRemoveRow(): boolean {
    return !!this.matrixRows.value && this.matrixRows.value > 2;
  }

  get canRemoveCol(): boolean {
    return !!this.matrixCols.value && this.matrixCols.value > 2;
  }

  ngOnInit(): void {
    this.labSnapshot$ = this.store.select(LabsSelectors.getLabSnapshot(this.lab.clientUrl));

    this.labSnapshot$.pipe(untilDestroyed(this), take(1)).subscribe((labSnapshot: LabSnapshot | null) => {
      this.matrixRows.setValue((labSnapshot?.input?.['matrix_rows'] as number) || DEFAULT_MATRIX_ROWS, {
        emitEvent: false,
      });
      this.matrixCols.setValue((labSnapshot?.input?.['matrix_cols'] as number) || DEFAULT_MATRIX_COLS, {
        emitEvent: false,
      });
      this.tol.setValue((labSnapshot?.input?.['tol'] as number) || DEFAULT_TOL, { emitEvent: false });
      this.maxIter.setValue((labSnapshot?.input?.['max_iter'] as number) || DEFAULT_MAX_ITER, { emitEvent: false });

      this.rebuildMatrix(
        this.matrixRows.value || DEFAULT_MATRIX_ROWS,
        this.matrixCols.value || DEFAULT_MATRIX_COLS,
        labSnapshot?.input?.['coefficient_matrix'] as (number | null)[][],
        labSnapshot?.input?.['constants'] as (number | null)[],
      );
    });

    this.inputForm.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      this.store.dispatch(new UpdateLabInput(this.lab, value));
    });

    this.matrixRows.valueChanges.pipe(untilDestroyed(this)).subscribe((rows) => {
      const coefficientMatrix = this.inputForm.get('coefficient_matrix')?.value as (number | null)[][];
      const constantVector = this.inputForm.get('constants')?.value as (number | null)[];
      this.rebuildMatrix(
        rows || DEFAULT_MATRIX_ROWS,
        this.matrixCols.value || DEFAULT_MATRIX_COLS,
        coefficientMatrix,
        constantVector,
      );
    });

    this.matrixCols.valueChanges.pipe(untilDestroyed(this)).subscribe((cols) => {
      const coefficientMatrix = this.inputForm.get('coefficient_matrix')?.value as (number | null)[][];
      const constantVector = this.inputForm.get('constants')?.value as (number | null)[];
      this.rebuildMatrix(
        this.matrixRows.value || DEFAULT_MATRIX_ROWS,
        cols || DEFAULT_MATRIX_COLS,
        coefficientMatrix,
        constantVector,
      );
    });
  }

  rebuildMatrix(
    rows: number,
    cols: number,
    coefficientMatrix: (number | null)[][],
    constantVector: (number | null)[],
  ): void {
    this.coefficientMatrix.clear();
    this.constantVector.clear();

    for (let i = 0; i < rows; i++) {
      const row = new FormArray<FormControl<number | null>>([], [Validators.required]);
      for (let j = 0; j < cols; j++) {
        row.push(new FormControl<number | null>(null, [Validators.required]));
      }
      this.coefficientMatrix.push(row);
      this.constantVector.push(new FormControl<number | null>(null, [Validators.required]));
    }

    if (!coefficientMatrix || !constantVector) return;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
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
    if (!this.matrixRows.value || !this.matrixCols.value) return;
    const randomMatrix = [];
    const randomVector = [];
    for (let i = 0; i < this.matrixRows.value; i++) {
      const row = [];
      for (let j = 0; j < this.matrixCols.value; j++) {
        row.push(Math.floor(Math.random() * 100));
      }
      randomMatrix.push(row);
      randomVector.push(Math.floor(Math.random() * 100));
    }
    this.rebuildMatrix(this.matrixRows.value, this.matrixCols.value, randomMatrix, randomVector);
  }

  getCoefficientByIndex(rowIndex: number, colIndex: number): FormControl<number | null> {
    return this.coefficientMatrix.at(rowIndex).at(colIndex) as FormControl<number>;
  }

  getConstantByIndex(index: number): FormControl<number | null> {
    return this.constantVector.at(index) as FormControl<number>;
  }

  addRow(): void {
    const size = this.matrixRows.value;
    if (size) this.matrixRows.setValue(size + 1);
  }

  removeRow(): void {
    const size = this.matrixRows.value;
    if (size && size >= 3) this.matrixRows.setValue(size - 1);
  }

  addCol(): void {
    const size = this.matrixCols.value;
    if (size) this.matrixCols.setValue(size + 1);
  }

  removeCol(): void {
    const size = this.matrixCols.value;
    if (size && size >= 3) this.matrixCols.setValue(size - 1);
  }

  getRoots(roots: string | number | boolean | OutputError | undefined): number[] | undefined {
    return roots as number[] | undefined;
  }

  submit(): void {
    if (!this.inputForm.valid) return;
    if (!this.tol.value) this.tol.setValue(DEFAULT_TOL, { emitEvent: false });
    if (!this.maxIter.value) this.maxIter.setValue(DEFAULT_MAX_ITER, { emitEvent: false });
    this.store.dispatch(new UpdateLabInput(this.lab, this.inputForm.value));
    this.store.dispatch(
      new CalculateLabOutput(this.lab, {
        json: true,
        skipKeys: ['matrix_rows', 'matrix_cols'],
      }),
    );
  }
}
