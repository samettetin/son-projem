import { Injectable } from '@angular/core';

export interface Invite {
  id: string;
  email: string;
  code: string;
  courseId?: string;
  orgId?: string;
  createdAt: number;
  accepted?: boolean;
}

@Injectable({ providedIn: 'root' })
export class InviteService {
  private k='invites';
  private read(): Invite[]{ try { return JSON.parse(localStorage.getItem(this.k)||'[]'); } catch { return []; } }
  private write(arr: Invite[]){ localStorage.setItem(this.k, JSON.stringify(arr)); }

  createInvite(email: string, courseId?: string, orgId?: string){
    const inv: Invite = { id: 'INV-'+Math.random().toString(36).slice(2,8).toUpperCase(), email, code: Math.random().toString(36).slice(2,6).toUpperCase(), courseId, orgId, createdAt: Date.now() };
    const arr=this.read(); arr.unshift(inv); this.write(arr);
    return inv;
  }
  generate(email: string, courseId?: string, orgId?: string){ return this.createInvite(email, courseId, orgId); }

  list(): Invite[]{ return this.read(); }
  accept(code:string){ const arr=this.read(); const x=arr.find(i=>i.code===code); if(x){ x.accepted=true; this.write(arr); return true; } return false; }
}
