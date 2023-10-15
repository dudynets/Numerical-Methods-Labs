import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabOutputComponent } from './lab-output.component';
import { MatIconModule } from '@angular/material/icon';
import { LabNoOutputComponent } from './lab-no-output/lab-no-output.component';
import { LabCalculatingComponent } from './lab-calculating/lab-calculating.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [
    LabOutputComponent,
    LabNoOutputComponent,
    LabCalculatingComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  exports: [
    LabOutputComponent,
    LabNoOutputComponent,
    LabCalculatingComponent,
  ],
})
export class LabOutputModule {}
