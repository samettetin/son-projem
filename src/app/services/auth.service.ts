import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private normalizeRole(r: any): any {
    if (!r) return 'student';
    const s = String(r).toLowerCase().replace(/[\s_-]+/g, '');
    // eşdeğerleri normalize et
    if (s.includes('super')) return 'superadmin';
    if (s.includes('education')) return 'educationmanager';
    if (s.includes('instruct')) return 'instructor';
    if (s.includes('observ')) return 'observer';
    return 'student';
  }
  private readonly LS_USERS = 'users';
  private readonly LS_CURRENT = 'currentUser';

  constructor() {
    this.ensureDefaultAdmin();
  }

  /** Uygulama ilk açıldığında varsayılan admin oluştur */
  private ensureDefaultAdmin(): void {
    const users = this.getUsers();
    if (!users.some(u => u.role === 'admin')) {
      const admin: User = {
        id: crypto.randomUUID(),
        fullName: 'Sistem Yöneticisi',
        email: 'admin@seba.com',
        password: 'admin123',
        role: 'admin',
        approved: true,
        rejected: false
      };
      users.push(admin);
      localStorage.setItem(this.LS_USERS, JSON.stringify(users));
    }
  }

  /** Tüm kullanıcıları getir */
  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
  }

  /** Kayıt işlemi */
  register(user: Omit<User, 'id' | 'approved' | 'rejected'>): { ok: boolean; message: string } {
    const users = this.getUsers();

    if (users.some(u => u.email === user.email)) {
      return { ok: false, message: 'Bu e-posta zaten kayıtlı.' };
    }

    const nu: User = {
      ...user,
      id: crypto.randomUUID(),
      approved: user.role === 'student',
      rejected: false
    };

    users.push(nu);
    localStorage.setItem(this.LS_USERS, JSON.stringify(users));

    return {
      ok: true,
      message: nu.approved
        ? 'Kayıt başarılı. Giriş yapabilirsiniz.'
        : 'Kayıt alındı. Hesabınız admin onayına gönderildi.'
    };
  }

  /** Giriş işlemi */
  login(email: string, password: string): User | null {
    const u = this.getUsers().find(x => x.email === email && x.password === password);
    if (!u) return null;

    if (u.rejected || (u.role !== 'student' && !u.approved)) return null;

    localStorage.setItem(this.LS_CURRENT, JSON.stringify(u));
    return u;
  }

  /** Admin panelinden onayla */
  approveUser(id: string): void {
    const users = this.getUsers();
    const i = users.findIndex(u => u.id === id);
    if (i > -1) {
      users[i].approved = true;
      users[i].rejected = false;
      localStorage.setItem(this.LS_USERS, JSON.stringify(users));
    }
  }

  /** Admin panelinden reddet */
  rejectUser(id: string): void {
    const users = this.getUsers();
    const i = users.findIndex(u => u.id === id);
    if (i > -1) {
      users[i].approved = false;
      users[i].rejected = true;
      localStorage.setItem(this.LS_USERS, JSON.stringify(users));
    }
  }

  /** Oturum yardımcıları */
  getCurrentUser(): User | null {
    const raw = localStorage.getItem(this.LS_CURRENT);
    return raw ? JSON.parse(raw) : null;
  }

  setCurrentUser(u: User): void {
    localStorage.setItem(this.LS_CURRENT, JSON.stringify(u));
  }

  logout(): void {
    localStorage.removeItem(this.LS_CURRENT);
  }

  /** Kullanıcı güncelle (hem listede hem current'ta senkron) */
  updateUser(id: string, patch: Partial<User>): User | null {
    const users = this.getUsers();
    const i = users.findIndex(u => u.id === id);
    if (i === -1) return null;
    users[i] = { ...users[i], ...patch } as User;
    localStorage.setItem(this.LS_USERS, JSON.stringify(users));
    const cur = this.getCurrentUser();
    if (cur?.id === id) {
      this.setCurrentUser(users[i]);
    }
    return users[i];
  }
}
