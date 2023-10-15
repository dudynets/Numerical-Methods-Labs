import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Lab, LABS } from '../../../lab/lab';

@Component({
  selector: 'nml-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  private readonly router = inject(Router);

  get labs(): Lab[] {
    return LABS;
  }

  isRouteActive(path: string): boolean {
    return this.router.url === path;
  }
}
