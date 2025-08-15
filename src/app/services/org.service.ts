import { Injectable } from '@angular/core';
import { Organization } from '../models/organization';

@Injectable({ providedIn: 'root' })
export class OrgService {
  private readonly LS_ORGS = 'organizations';

  getAll(): Organization[] {
    return JSON.parse(localStorage.getItem(this.LS_ORGS) || '[]');
  }

  saveAll(orgs: Organization[]): void {
    localStorage.setItem(this.LS_ORGS, JSON.stringify(orgs));
  }

  create(name: string, description = '', createdByUserId?: string): Organization {
    const orgs = this.getAll();
    const org: Organization = {
      id: crypto.randomUUID(),
      name,
      description,
      createdAt: new Date().toISOString(),
      createdByUserId
    };
    orgs.push(org);
    this.saveAll(orgs);
    return org;
  }

  update(id: string, patch: Partial<Organization>): Organization | null {
    const orgs = this.getAll();
    const i = orgs.findIndex(o => o.id === id);
    if (i === -1) return null;
    orgs[i] = { ...orgs[i], ...patch };
    this.saveAll(orgs);
    return orgs[i];
  }

  remove(id: string): void {
    const orgs = this.getAll().filter(o => o.id !== id);
    this.saveAll(orgs);
  }
}
