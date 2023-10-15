import { Selector } from '@ngxs/store';
import { ServerState } from './server.state';
import { ConnectionStatus, ServerHealth, ServerStateModel, ServerTaskState } from './server.model';

export class ServerSelectors {
  @Selector([ServerState])
  static getConnectionStatus(state: ServerStateModel): ConnectionStatus {
    return state.connectionStatus;
  }

  @Selector([ServerState])
  static getApiUrl(state: ServerStateModel): string | null {
    return state.apiUrl;
  }

  @Selector([ServerState])
  static getServerHealth(state: ServerStateModel): ServerHealth | null {
    return state.serverHealth;
  }

  @Selector([ServerState])
  static canRunTask(state: ServerStateModel): boolean {
    return state.connectionStatus === ConnectionStatus.Connected && state.serverTaskState === ServerTaskState.Idle;
  }

  @Selector([ServerState])
  static getServerTaskState(state: ServerStateModel): ServerTaskState | null {
    return state.serverTaskState;
  }
}
