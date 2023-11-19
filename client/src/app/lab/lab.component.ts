import {
  ChangeDetectionStrategy,
  Component,
  inject,
  InjectionToken,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Lab, LabComponentData, LABS } from './lab';
import { ComponentPortal } from '@angular/cdk/portal';
import { ClearLabOutput } from '@core/state/labs/labs.actions';
import { Store } from '@ngxs/store';
import { combineLatest, map, Observable } from 'rxjs';
import { LabsSelectors } from '@core/state/labs/labs.selectors';
import { ServerSelectors } from '@core/state/server/server.selectors';
import { ServerTaskState } from '@core/state/server/server.model';

export const LAB_COMPONENT_DATA = new InjectionToken<{}>('LAB_COMPONENT_DATA');

@Component({
  selector: 'nml-lab',
  templateUrl: './lab.component.html',
  styleUrls: ['./lab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabComponent implements OnChanges {
  @Input()
  labId: string | undefined;

  componentPortal: ComponentPortal<unknown> | null = null;
  canClearOutput$!: Observable<boolean>;

  private readonly store = inject(Store);
  private readonly injector = inject(Injector);

  get lab(): Lab | undefined {
    return LABS.find((lab) => lab.clientUrl === this.labId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['labId']) {
      if (!this.lab) return;
      this.componentPortal = new ComponentPortal(this.lab.component, null, this.createInjector({ lab: this.lab }));

      this.canClearOutput$ = combineLatest([
        this.store.select(LabsSelectors.getLabSnapshot(this.lab.clientUrl)),
        this.store.select(ServerSelectors.getServerTaskState),
      ]).pipe(map(([snapshot, taskState]) => !!snapshot?.output && taskState !== ServerTaskState.Calculating));
    }
  }

  clearOutput(): void {
    if (!this.lab) return;
    this.store.dispatch(new ClearLabOutput(this.lab));
  }

  private createInjector(componentData: LabComponentData): Injector {
    return Injector.create({
      parent: this.injector,
      providers: [
        { provide: LAB_COMPONENT_DATA, useValue: componentData },
      ],
    });
  }
}
