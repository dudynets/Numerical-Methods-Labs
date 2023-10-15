import { ConnectionStatus, DEFAULT_SERVER_STATE, ServerStateModel, ServerTaskState } from './server.model';
import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { inject, Injectable } from '@angular/core';
import { Connect, SetApiUrl, UpdateServerConnectionStatus, UpdateServerTaskState } from './server.actions';
import { WebSocketService } from '../../services/web-socket.service';
import { StorageService } from '../../services/storage.service';
import { APP_CONFIG } from '@nml/app.config';
import { delay, Observable, of, tap } from 'rxjs';

const API_URL_STORAGE_KEY = 'apiUrl';

@State<ServerStateModel>({
  name: 'server',
  defaults: DEFAULT_SERVER_STATE,
})
@Injectable()
export class ServerState implements NgxsOnInit {
  private readonly webSocketService = inject(WebSocketService);
  private readonly storageService = inject(StorageService);

  ngxsOnInit(ctx: StateContext<ServerStateModel>): void {
    const apiUrl = this.storageService.getItem(API_URL_STORAGE_KEY);
    ctx.dispatch(new SetApiUrl(apiUrl || 'http://localhost:8000/api'));
  }

  @Action(Connect)
  connect(ctx: StateContext<ServerStateModel>, action: Connect): Observable<null> {
    ctx.patchState({
      connectionStatus: ConnectionStatus.Connecting,
      serverHealth: null,
      serverTaskState: null,
    });

    return of(null).pipe(
      delay(APP_CONFIG.connectionDelayMs),
      tap(() => {
        const apiUrl = action.apiUrl || ctx.getState().apiUrl;
        if (apiUrl) {
          this.webSocketService.connect(apiUrl);
        }
      }),
    );
  }

  @Action(UpdateServerConnectionStatus)
  updateServerConnectionStatus(ctx: StateContext<ServerStateModel>, action: UpdateServerConnectionStatus): void {
    ctx.patchState({
      connectionStatus: action.connectionStatus,
      serverHealth: action.serverHealth ?? null,
      serverTaskState:
        action.connectionStatus === ConnectionStatus.Connected
          ? ctx.getState().serverTaskState || ServerTaskState.Idle
          : null,
    });
  }

  @Action(UpdateServerTaskState)
  updateServerTaskState(ctx: StateContext<ServerStateModel>, action: UpdateServerTaskState): void {
    ctx.patchState({
      serverTaskState: action.serverTaskState,
    });
  }

  @Action(SetApiUrl)
  setApiUrl(ctx: StateContext<ServerStateModel>, action: SetApiUrl): void {
    ctx.patchState({
      apiUrl: action.apiUrl,
    });
    this.storageService.setItem(API_URL_STORAGE_KEY, action.apiUrl);
    ctx.dispatch(new Connect(action.apiUrl));
  }
}
