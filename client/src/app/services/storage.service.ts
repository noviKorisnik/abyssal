import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * Storage abstraction service
 * Uses localStorage for production and sessionStorage for development
 * This provides better persistence in production while keeping development
 * sessions isolated for easier testing
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: Storage;

  constructor() {
    // Use localStorage in production, sessionStorage in development
    this.storage = environment.production ? localStorage : sessionStorage;
  }

  /**
   * Get item from storage
   */
  getItem(key: string): string | null {
    return this.storage.getItem(key);
  }

  /**
   * Set item in storage
   */
  setItem(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  /**
   * Clear all items from storage
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Check if key exists in storage
   */
  hasItem(key: string): boolean {
    return this.storage.getItem(key) !== null;
  }

  /**
   * Get all keys in storage
   */
  keys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  }
}
