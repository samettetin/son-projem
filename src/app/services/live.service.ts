import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LiveService {
  private kActive = 'live-active-users';
  private kFeed = 'live-activity-feed';
  private feed$ = new BehaviorSubject<string[]>(this.readFeed());

  private readFeed(): string[] {
    try { return JSON.parse(localStorage.getItem(this.kFeed)||'[]'); } catch { return []; }
  }
  private writeFeed(arr: string[]) { localStorage.setItem(this.kFeed, JSON.stringify(arr.slice(0,200))); }

  private getActive(): Record<string, number> {
    try { return JSON.parse(localStorage.getItem(this.kActive)||'{}'); } catch { return {}; }
  }
  getActiveCount(): number {
    return Object.keys(this.getActive()).length;
  }

  getActivityFeed(): Observable<string[]> { return this.feed$.asObservable(); }
  getActiveUsers(courseId?: string){ return this.getActiveCount(); }

  toggleUserPresence(courseId: string, userId: string, online: boolean){
    const a = this.getActive();
    if (online) a[userId]=Date.now(); else delete a[userId];
    localStorage.setItem(this.kActive, JSON.stringify(a));
  }

  addActivity(text: string){
    const arr = [text, ...this.readFeed()];
    this.writeFeed(arr);
    this.feed$.next(arr);
  }
  getFeed(): string[] { return this.readFeed(); }
}
