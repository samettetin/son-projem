import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    const u: User | null = this.auth.getCurrentUser();
    const isAdminLike = u && (u.role === 'admin' || u.role === 'superadmin' || u.role === 'instructor' || u.role === 'educationmanager');
    if (!isAdminLike) {
      this.router.navigateByUrl('/login');
      return false;
    }
    return true;
  }
}
