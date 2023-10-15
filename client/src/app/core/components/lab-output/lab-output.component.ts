import { Component, Input } from '@angular/core';
import { OutputError } from '@core/state/labs/labs.model';

@Component({
  selector: 'nml-lab-output',
  templateUrl: './lab-output.component.html',
  styleUrls: ['./lab-output.component.scss'],
})
export class LabOutputComponent {
  @Input({ required: true })
  error?: OutputError;
}
