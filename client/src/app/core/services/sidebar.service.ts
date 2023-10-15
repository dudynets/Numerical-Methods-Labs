import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { MatDrawerMode } from '@angular/material/sidenav';

const SIDEBAR_STORAGE_KEY = 'isSidebarOpened';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private readonly storageService = inject(StorageService);

  constructor() {
    const isSidebarOpened =
      this.sidebarMode === 'over' ? false : JSON.parse(this.storageService.getItem(SIDEBAR_STORAGE_KEY) || 'false');
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
    this.storageService.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(state));
  }
}
