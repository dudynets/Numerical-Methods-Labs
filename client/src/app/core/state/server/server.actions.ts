import { ConnectionStatus, ServerHealth, ServerTaskState } from './server.model';

export class Connect {
  static readonly type = '[Server] Connect';
  constructor(public apiUrl?: string) {}
}

export class UpdateServerConnectionStatus {
  static readonly type = '[Server] Update Server Connection Status';
  constructor(public connectionStatus: ConnectionStatus, public serverHealth?: ServerHealth) {}
}

export class UpdateServerTaskState {
  static readonly type = '[Server] Update Server Task State';
  constructor(public serverTaskState: ServerTaskState) {}
}

export class SetApiUrl {
  static readonly type = '[Server] Set API URL';
  constructor(public apiUrl: string) {}
}
