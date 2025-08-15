import { Injectable } from '@angular/core';

export interface SavedView { id:string; title:string; query:string; level:''|'beginner'|'intermediate'|'advanced'; createdAt:number; }

@Injectable({ providedIn: 'root' })
export class SearchService {
  private key='saved-views';

  score(text:string, term:string){ 
    const t = (term||'').toLowerCase().split(/\s+/).filter(Boolean);
    let s = 0; const low = (text||'').toLowerCase();
    for (const w of t){ if (low.includes(w)) s += 1; }
    return s;
  }

  save(title:string, q:string, level:''|'beginner'|'intermediate'|'advanced'){
    const arr = this.list();
    const v: SavedView = { id: 'V-'+Math.random().toString(36).slice(2,8), title, query:q, level, createdAt: Date.now() };
    arr.unshift(v); localStorage.setItem(this.key, JSON.stringify(arr.slice(0,30)));
    return v;
  }
  list(): SavedView[]{ try { return JSON.parse(localStorage.getItem(this.key)||'[]'); } catch { return []; } }
  remove(id:string){ const arr=this.list().filter((v:SavedView)=>v.id!==id); localStorage.setItem(this.key, JSON.stringify(arr)); }
}
