import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly key = 'userId';
  private userIdSubject: BehaviorSubject<string>;

  constructor(private storage: StorageService) {
    let id = this.storage.getItem(this.key);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      this.storage.setItem(this.key, id);
    }
    this.userIdSubject = new BehaviorSubject<string>(id!);
  }

  getUserId$(): Observable<string> {
    return this.userIdSubject.asObservable();
  }

  getUserId(): string {
    return this.userIdSubject.value;
  }

  setUserId(id: string) {
    this.storage.setItem(this.key, id);
    this.userIdSubject.next(id);
  }

  clearUserId() {
    this.storage.removeItem(this.key);
    this.userIdSubject.next('');
  }
}
