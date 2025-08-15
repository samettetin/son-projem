import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark' | 'focus';
export interface AppSettings { theme: Theme; fontScale: number; }

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private KEY = 'settings';
  private state: AppSettings = { theme: 'dark', fontScale: 1 };

  constructor(){
    const raw = localStorage.getItem(this.KEY);
    if (raw) {
      try { this.state = { ...this.state, ...(JSON.parse(raw) as Partial<AppSettings>) } as AppSettings; } catch {}
    }
    this.apply();
  }

  get(): AppSettings { return this.state; }

  patch(v: Partial<AppSettings>) {
    this.state = { ...this.state, ...v };
    this.persist();
    this.apply();
  }

  private apply(){
    try {
      document.documentElement.setAttribute('data-theme', this.state.theme);
      document.documentElement.style.setProperty('--font-scale', String(this.state.fontScale || 1));
    } catch {}
  }

  private persist(){
    try { localStorage.setItem(this.KEY, JSON.stringify(this.state)); } catch {}
  }
}
