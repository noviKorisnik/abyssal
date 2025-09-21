import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly key = 'userId';
  private userIdSubject: BehaviorSubject<string>;

  constructor() {
    let id = sessionStorage.getItem(this.key);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      sessionStorage.setItem(this.key, id);
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
    sessionStorage.setItem(this.key, id);
    this.userIdSubject.next(id);
  }

  clearUserId() {
    sessionStorage.removeItem(this.key);
    this.userIdSubject.next('');
  }
}
