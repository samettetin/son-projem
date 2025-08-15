import { Injectable } from '@angular/core';

export interface MediaItem {
  id: string;
  name: string;
  mime: string;
  dataUrl: string; // base64 data URL
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly LS = 'mediaItems';

  private read(): MediaItem[] { return JSON.parse(localStorage.getItem(this.LS) || '[]'); }
  private write(list: MediaItem[]): void { localStorage.setItem(this.LS, JSON.stringify(list)); }

  list(): MediaItem[] { return this.read().sort((a,b)=>b.createdAt.localeCompare(a.createdAt)); }
  remove(id: string): void { this.write(this.read().filter(m => m.id !== id)); }

  save(name: string, mime: string, dataUrl: string): MediaItem {
    const all = this.read();
    const item: MediaItem = { id: crypto.randomUUID(), name, mime, dataUrl, createdAt: new Date().toISOString() };
    all.push(item);
    this.write(all);
    return item;
  }
}


