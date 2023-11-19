import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatDrawerMode } from '@angular/material/sidenav';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  constructor() {
    const isSidebarOpened = this.sidebarMode === 'side';
    this.setSidebarState(isSidebarOpened);
  }

  _isSidebarOpened$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get isSidebarOpened$(): Observable<boolean> {
    return this._isSidebarOpened$.asObservable();
  }

  get sidebarMode(): MatDrawerMode {
    const screenWidth: number = window.innerWidth;
    return screenWidth < 768 ? 'over' : 'side';
  }

  toggleSidebar(): void {
    this.setSidebarState(!this._isSidebarOpened$.value);
  }

  private setSidebarState(state: boolean): void {
    this._isSidebarOpened$.next(state);
  }
}
