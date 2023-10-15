import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnsureModuleLoadedOnceGuard } from './guards/ensure-module-loaded-once.guard';
import { HeaderModule } from './components/header/header.module';
import { ContentModule } from './components/content/content.module';
import { SidebarModule } from './components/sidebar/sidebar.module';
import { FooterModule } from './components/footer/footer.module';
import { HttpClientModule } from '@angular/common/http';

const COMPONENTS = [
  HeaderModule,
  ContentModule,
  SidebarModule,
  FooterModule,
];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    ...COMPONENTS,
  ],
  exports: [
    ...COMPONENTS,
  ],
  declarations: [],
})
export class CoreModule extends EnsureModuleLoadedOnceGuard {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    super(parentModule);
  }
}
