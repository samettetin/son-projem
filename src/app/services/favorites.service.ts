import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly LS = 'favorites';

  private read(): string[] {
    try { return JSON.parse(localStorage.getItem(this.LS) || '[]'); } catch { return []; }
  }
  private write(list: string[]): void {
    localStorage.setItem(this.LS, JSON.stringify(list));
  }

  list(): string[] { return this.read(); }

  add(courseId: string): void {
    const all = this.read();
    if (!all.includes(courseId)) {
      all.push(courseId);
      this.write(all);
    }
  }
  remove(courseId: string): void {
    this.write(this.read().filter(id => id !== courseId));
  }

  toggle(courseId: string): void {
    const all = this.read();
    if (all.includes(courseId)) {
      this.remove(courseId);
    } else {
      this.add(courseId);
    }
  }
}
