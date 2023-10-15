import { Component, inject } from '@angular/core';
import { ServerSelectors } from '../../state/server/server.selectors';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ConnectionStatus, ServerHealth } from '../../state/server/server.model';
import { Connect } from '../../state/server/server.actions';

@Component({
  selector: 'nml-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  @Select(ServerSelectors.getConnectionStatus)
  connectionStatus$!: Observable<ConnectionStatus>;

  @Select(ServerSelectors.getApiUrl)
  apiUrl$!: Observable<string | null>;

  @Select(ServerSelectors.getServerHealth)
  serverHealth$!: Observable<ServerHealth | null>;
  protected readonly ConnectionStatus = ConnectionStatus;
  private readonly store = inject(Store);

  reconnect(): void {
    this.store.dispatch(new Connect());
  }
}
