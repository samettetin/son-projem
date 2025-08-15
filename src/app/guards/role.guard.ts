// src/app/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Uygulamadaki rol evreni
type Role =
  | 'superadmin'
  | 'admin'
  | 'educationmanager'
  | 'instructor'
  | 'observer'
  | 'student';

// Her rol için “doğru” dashboard
const DASHBOARD_BY_ROLE: Record<Role, string> = {
  superadmin: '/dashboard-admin',
  admin: '/dashboard-admin',
  educationmanager: '/dashboard-em',
  instructor: '/dashboard-instructor',
  observer: '/dashboard-observer',
  student: '/dashboard-student',
};

function normalizeRole(r: any): Role {
  return String(r || '').toLowerCase().replace(/\s+/g, '') as Role;
}

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const allowedRaw = (route.data?.['roles'] as string[] | undefined) ?? [];
    const allowed = allowedRaw.map(normalizeRole);

    const u = this.auth.getCurrentUser();
    if (!u) return this.router.parseUrl('/login');

    const role = normalizeRole(u.role);

    // superadmin her yere girebilir
    if (role === 'superadmin') return true;

    // allowed boşsa serbest bırak
    if (allowed.length === 0) return true;

    // '*' veya 'any' varsa serbest bırak
    if (allowed.includes('*' as Role) || allowed.includes('any' as Role)) return true;

    // rol yetkili mi?
    if (allowed.includes(role)) return true;

    // yetkisiz → rolüne uygun dashboard'a yönlendir
    const target = DASHBOARD_BY_ROLE[role] ?? '/';
    return this.router.parseUrl(target);
  }
}
