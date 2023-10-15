import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ServerSelectors } from '@core/state/server/server.selectors';
import { Observable } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SetApiUrl } from '@core/state/server/server.actions';

@UntilDestroy()
@Component({
  selector: 'nml-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  @Select(ServerSelectors.getApiUrl)
  apiUrl$!: Observable<string | null>;

  apiUrlFormControl = new FormControl('', [Validators.required, Validators.pattern(/^https?:\/\/.+$/)]);

  private readonly store = inject(Store);

  get apiUrlValueChanged(): boolean {
    return this.apiUrlFormControl.value !== this.store.selectSnapshot(ServerSelectors.getApiUrl);
  }

  ngOnInit() {
    this.apiUrl$.pipe(untilDestroyed(this)).subscribe((apiUrl) => {
      this.apiUrlFormControl.setValue(apiUrl);
    });
  }

  setApiUrl(): void {
    if (!this.apiUrlFormControl.value) return;
    const apiUrl = this.apiUrlFormControl.value.replace(/\/+$/, '');
    this.store.dispatch(new SetApiUrl(apiUrl));
    this.resetApiUrl();
  }

  resetApiUrl(): void {
    const initialApiUrl = this.store.selectSnapshot(ServerSelectors.getApiUrl);
    this.apiUrlFormControl.reset(initialApiUrl);
  }
}
