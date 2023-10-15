import { Injectable } from '@angular/core';

const LOCAL_STORAGE_PREFIX = 'nml-';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  setItem(key: string, value: string): void {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, value);
  }

  getItem(key: string): string | null {
    return localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`) || '';
  }
}
