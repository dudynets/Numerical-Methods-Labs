import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { UpdateServerConnectionStatus } from '../state/server/server.actions';
import { ConnectionStatus, ServerHealth } from '../state/server/server.model';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private webSocket: WebSocket | null = null;
  private readonly store = inject(Store);

  connect(url: string): void {
    if (!url) throw new Error('WebSocket URL is required');
    url = url.replace(/^http/, 'ws') + '/server_health';

    try {
      if (this.webSocket) {
        this.webSocket.close();
        this.webSocket = null;
      }
      this.webSocket = new WebSocket(url);
    } catch (error) {
      console.error(error);
      this.store.dispatch(new UpdateServerConnectionStatus(ConnectionStatus.Disconnected));
      return;
    }

    this.webSocket.onmessage = (event) => {
      const serverHealth: ServerHealth | null = JSON.parse(event.data);
      if (serverHealth)
        return this.store.dispatch(new UpdateServerConnectionStatus(ConnectionStatus.Connected, serverHealth));
      return this.store.dispatch(new UpdateServerConnectionStatus(ConnectionStatus.Disconnected));
    };
    this.webSocket.onerror = () => this.store.dispatch(new UpdateServerConnectionStatus(ConnectionStatus.Disconnected));
    this.webSocket.onclose = () => {
      this.store.dispatch(new UpdateServerConnectionStatus(ConnectionStatus.Disconnected));
      this.webSocket?.close();
    };
  }
}
