
import { Injectable } from '@angular/core';

export type ModuleId = 'intro'|'intermediate'|'advanced'|'exam'|string;
export interface LpModule { id: ModuleId; title: string; required: boolean; passScore?: number; minCompletion?: number; }
export interface Lp { courseId: string; modules: LpModule[]; dependencies: Record<string,string[]>; }

@Injectable({ providedIn: 'root' })
export class LearningPathService {
  private key(courseId: string){ return 'lp-' + courseId; }

  get(courseId: string): Lp {
    const raw = localStorage.getItem(this.key(courseId));
    if (raw) return JSON.parse(raw);
    const lp: Lp = {
      courseId,
      modules: [
        { id:'intro', title:'Giriş', required:true, minCompletion:50 },
        { id:'intermediate', title:'Orta Seviye', required:true, minCompletion:60 },
        { id:'advanced', title:'İleri Seviye', required:false, minCompletion:70 },
        { id:'exam', title:'Sınav', required:true, passScore:70 }
      ],
      dependencies: { 'advanced': ['intermediate'], 'exam': ['intermediate'] }
    };
    localStorage.setItem(this.key(courseId), JSON.stringify(lp));
    return lp;
  }

  save(lp: Lp){ localStorage.setItem(this.key(lp.courseId), JSON.stringify(lp)); }
}
