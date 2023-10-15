import { Component, inject, OnInit } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'nml-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isSidebarOpened$: Observable<boolean> | null = null;

  private readonly sidebarService = inject(SidebarService);

  ngOnInit(): void {
    this.isSidebarOpened$ = this.sidebarService.isSidebarOpened$;
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }
}
