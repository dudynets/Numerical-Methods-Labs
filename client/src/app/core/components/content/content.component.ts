import { Component, inject } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { Observable } from 'rxjs';
import { MatDrawerMode } from '@angular/material/sidenav';

@Component({
  selector: 'nml-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
})
export class ContentComponent {
  private readonly sidebarService = inject(SidebarService);

  get isSidebarOpened$(): Observable<boolean> {
    return this.sidebarService.isSidebarOpened$;
  }

  get sidebarMode(): MatDrawerMode {
    const screenWidth: number = window.innerWidth;
    return screenWidth < 768 ? 'over' : 'side';
  }
}
