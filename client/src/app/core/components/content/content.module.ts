import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentComponent } from './content.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    ContentComponent,
  ],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
  ],
  exports: [
    ContentComponent,
  ],
})
export class ContentModule {}
