export interface ServerStateModel {
  connectionStatus: ConnectionStatus;
  apiUrl: string | null;
  serverHealth: ServerHealth | null;
  serverTaskState: ServerTaskState | null;
}

export enum ConnectionStatus {
  Connecting = 'Connecting',
  Connected = 'Connected',
  Disconnected = 'Disconnected',
}

export interface ServerHealth {
  cpu_load: number;
  memory_load: number;
  available_memory: number;
  total_memory: number;
  used_memory: number;
}

export enum ServerTaskState {
  Idle = 'Idle',
  Calculating = 'Calculating',
}

export const DEFAULT_SERVER_STATE: ServerStateModel = {
  connectionStatus: ConnectionStatus.Disconnected,
  apiUrl: null,
  serverHealth: null,
  serverTaskState: null,
};
