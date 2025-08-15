import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly key = 'theme-prefs';
  private readonly paletteKey = 'palette';

  get(): any {
    try { return JSON.parse(localStorage.getItem(this.key) || '{}'); }
    catch { return {}; }
  }

  set(prefs: any): void {
    localStorage.setItem(this.key, JSON.stringify(prefs || {}));
  }

  apply(theme?: string, palette?: string): void {
    const prefs = this.get() || {};
    const t = theme || (prefs.theme as string) || document.documentElement.getAttribute('data-theme') || 'dark';
    const p = palette || localStorage.getItem(this.paletteKey) || document.documentElement.getAttribute('data-palette') || 'obsidian';
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.setAttribute('data-palette', p);
    // optional: font size / contrast
    if (prefs.fontSize) document.documentElement.style.setProperty('--font-size', String(prefs.fontSize));
    if (prefs.contrast) document.documentElement.style.setProperty('--contrast', String(prefs.contrast));
  }

  setPalette(palette: string){ 
    localStorage.setItem(this.paletteKey, palette); 
    this.apply(); 
  }

  getPalette(): string {
    return localStorage.getItem(this.paletteKey) || 'obsidian';
  }
}
