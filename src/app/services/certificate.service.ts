import { Injectable } from '@angular/core';

export type CertificateTemplate = 'classic'|'elegant'|'minimal';

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  username?: string;
  issuedAt: number;
  qr: string; // doğrulama kodu
  payload?: any;
}

@Injectable({ providedIn: 'root' })
export class CertificateService {
  private storeKey = 'certificates';

  // ---- basic persistence for certificates ----
  private listAll(): Certificate[] {
    try { return JSON.parse(localStorage.getItem(this.storeKey) || '[]'); } catch { return []; }
  }
  private saveAll(arr: Certificate[]): void {
    localStorage.setItem(this.storeKey, JSON.stringify(arr));
  }

  listByUser(userId: string): Certificate[] {
    return this.listAll().filter(c => c.userId === userId);
  }

  create(user: { id:string; fullName?:string; username?:string }, course: { id:string; title?:string }, template: CertificateTemplate = 'elegant'): Certificate {
    const c: Certificate = {
      id: `cert_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      userId: user.id,
      courseId: course.id,
      courseTitle: course.title || '',
      username: user.fullName || user.username,
      issuedAt: Date.now(),
      qr: Math.random().toString(36).slice(2),
      payload: { template }
    };
    const arr = this.listAll();
    arr.push(c);
    this.saveAll(arr);
    return c;
  }

  // ---- template preferences per course ----
  private tplKey(courseId: string){ return 'cert-template-' + courseId; }
  setTemplate(courseId: string, tpl: CertificateTemplate){ localStorage.setItem(this.tplKey(courseId), tpl); }
  getTemplate(courseId: string): CertificateTemplate {
    return (localStorage.getItem(this.tplKey(courseId)) as CertificateTemplate) || 'elegant';
  }

  // Backwards-compat alias for older components
  generate(user: { id:string; fullName?:string; username?:string }, course: { id:string; title?:string }, template?: CertificateTemplate){
    const tpl = template || this.getTemplate(course.id);
    return this.create(user, course, tpl);
  }
}
