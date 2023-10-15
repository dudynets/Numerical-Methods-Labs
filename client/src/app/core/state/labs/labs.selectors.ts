import { createSelector } from '@ngxs/store';
import { LabsState } from '@core/state/labs/labs.state';
import { LabSnapshot, LabsStateModel } from '@core/state/labs/labs.model';

export class LabsSelectors {
  static getLabSnapshot(labId: string): (state: LabsStateModel) => LabSnapshot | null {
    return createSelector([LabsState], (state: LabsStateModel) => state[labId]);
  }
}
