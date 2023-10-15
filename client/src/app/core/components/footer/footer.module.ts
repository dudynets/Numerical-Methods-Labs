import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ServerLoadComponent } from './server-load/server-load.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [
    FooterComponent,
    ServerLoadComponent,
  ],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatProgressBarModule,
  ],
  exports: [
    FooterComponent,
  ],
})
export class FooterModule {}
