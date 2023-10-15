import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { inject, Injectable } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { DEFAULT_LABS_STATE, LabOutput, LabSnapshot, LabsStateModel } from './labs.model';
import { CalculateLabOutput, ClearLabOutput, UpdateLabInput } from '@core/state/labs/labs.actions';
import { LABS } from '@lab/lab';
import { HttpService } from '@core/services/http.service';
import { catchError, delay, map, Observable, of, tap } from 'rxjs';
import { UpdateServerTaskState } from '@core/state/server/server.actions';
import { ServerTaskState } from '@core/state/server/server.model';
import { HttpErrorResponse } from '@angular/common/http';
import { APP_CONFIG } from '@nml/app.config';

const LAB_SNAPSHOT_STORAGE_PREFIX = 'lab-';

@State<LabsStateModel>({
  name: 'labs',
  defaults: DEFAULT_LABS_STATE,
})
@Injectable()
export class LabsState implements NgxsOnInit {
  private readonly storageService = inject(StorageService);
  private readonly httpService = inject(HttpService);

  ngxsOnInit(ctx: StateContext<LabsStateModel>): void {
    LABS.forEach((lab) => {
      const labSnapshotJSON = this.storageService.getItem(`${LAB_SNAPSHOT_STORAGE_PREFIX}${lab.clientUrl}`);
      const labSnapshot: LabSnapshot | null = labSnapshotJSON ? JSON.parse(labSnapshotJSON) : null;
      ctx.patchState({
        [lab.clientUrl]: labSnapshot,
      });
    });
  }

  @Action(UpdateLabInput)
  updateLabInput(ctx: StateContext<LabsStateModel>, action: UpdateLabInput): void {
    ctx.patchState({
      [action.lab.clientUrl]: {
        output: ctx.getState()[action.lab.clientUrl]?.output ?? null,
        input: action.labInput,
      },
    });
    const labSnapshot = ctx.getState()[action.lab.clientUrl];
    if (labSnapshot) {
      this.storageService.setItem(`${LAB_SNAPSHOT_STORAGE_PREFIX}${action.lab.clientUrl}`, JSON.stringify(labSnapshot));
    }
  }

  @Action(CalculateLabOutput)
  calculateLabOutput(
    ctx: StateContext<LabsStateModel>,
    action: CalculateLabOutput,
  ): Observable<LabOutput | HttpErrorResponse> | void {
    const labInput = ctx.getState()[action.lab.clientUrl]?.input ?? null;
    if (labInput) {
      ctx.dispatch(new UpdateServerTaskState(ServerTaskState.Calculating));

      return this.httpService.calculateLab(action.lab, labInput).pipe(
        delay(APP_CONFIG.calculationDelayMs),
        tap(() => {
          ctx.dispatch(new UpdateServerTaskState(ServerTaskState.Idle));
        }),
        tap((labOutput) => {
          ctx.patchState({
            [action.lab.clientUrl]: {
              output: labOutput,
              input: labInput,
            },
          });
          const labSnapshot = ctx.getState()[action.lab.clientUrl];
          if (labSnapshot) {
            this.storageService.setItem(
              `${LAB_SNAPSHOT_STORAGE_PREFIX}${action.lab.clientUrl}`,
              JSON.stringify(labSnapshot),
            );
          }
        }),
        catchError((errorResponse: HttpErrorResponse) => {
          return of(null)
            .pipe(delay(APP_CONFIG.calculationDelayMs))
            .pipe(
              map(() => {
                ctx.dispatch(new UpdateServerTaskState(ServerTaskState.Idle));
                ctx.patchState({
                  [action.lab.clientUrl]: {
                    output: {
                      error: {
                        status: errorResponse.status,
                        statusText: errorResponse.statusText,
                        detail: errorResponse.error,
                      },
                    },
                    input: labInput,
                  },
                });
                const labSnapshot = ctx.getState()[action.lab.clientUrl];
                if (labSnapshot) {
                  this.storageService.setItem(
                    `${LAB_SNAPSHOT_STORAGE_PREFIX}${action.lab.clientUrl}`,
                    JSON.stringify(labSnapshot),
                  );
                }
                return errorResponse;
              }),
            );
        }),
      );
    }
  }

  @Action(ClearLabOutput)
  clearLabSnapshot(ctx: StateContext<LabsStateModel>, action: ClearLabOutput): void {
    ctx.patchState({
      [action.lab.clientUrl]: {
        input: ctx.getState()[action.lab.clientUrl]?.input ?? null,
        output: null,
      },
    });
    const labSnapshot = ctx.getState()[action.lab.clientUrl];
    if (labSnapshot) {
      this.storageService.setItem(`${LAB_SNAPSHOT_STORAGE_PREFIX}${action.lab.clientUrl}`, JSON.stringify(labSnapshot));
    }
  }
}
