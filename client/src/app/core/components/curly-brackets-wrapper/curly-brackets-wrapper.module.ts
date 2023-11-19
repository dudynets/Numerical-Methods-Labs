import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurlyBracketsWrapperComponent } from './curly-brackets-wrapper.component';

@NgModule({
  declarations: [
    CurlyBracketsWrapperComponent,
  ],
  exports: [
    CurlyBracketsWrapperComponent,
  ],
  imports: [
    CommonModule,
  ],
})
export class CurlyBracketsWrapperModule {}
