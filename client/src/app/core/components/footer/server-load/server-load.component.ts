import { Component, Input } from '@angular/core';
import { ServerHealth } from '../../../state/server/server.model';
import { convertBytes } from '../../../helpers/convert-bytes';

@Component({
  selector: 'nml-server-load',
  templateUrl: './server-load.component.html',
  styleUrls: ['./server-load.component.scss'],
})
export class ServerLoadComponent {
  @Input({ required: true })
  serverHealth!: ServerHealth;
  protected readonly convertBytes = convertBytes;

  get cpuLoadTooltip(): string {
    return `CPU Load: ${this.serverHealth.cpu_load.toFixed(2)}%`;
  }

  get memoryUsageTooltip(): string {
    return `Memory Load: ${this.serverHealth.memory_load.toFixed(2)}%`;
  }
}
