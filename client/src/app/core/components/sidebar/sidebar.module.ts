import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar.component';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    SidebarComponent,
  ],
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    RouterLink,
    MatToolbarModule,
    MatExpansionModule,
    MatTooltipModule,
  ],
  exports: [
    SidebarComponent,
  ],
})
export class SidebarModule {}
