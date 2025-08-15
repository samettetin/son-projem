// src/app/pages/admin-approval/admin-approval.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { User } from '../../models/user';
import { getRoleLabel } from '../../utils/role-label';

@Component({
  selector: 'app-admin-approval',
  templateUrl: './admin-approval.component.html',
  styleUrls: ['./admin-approval.component.scss']
})
export class AdminApprovalComponent implements OnInit {
  pendingUsers: User[] = [];
  rejectedUsers: User[] = [];
  activeTab: 'pending' | 'rejected' = 'pending';

  // HTML’de {{ getRoleLabel(role) }} için
  getRoleLabel = getRoleLabel;

  constructor(
    private auth: AuthService,
    private ui: UiService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  /** Bekleyen (öğrenci olmayan, reddedilmemiş) ve reddedilmiş listeleri doldur */
  load(): void {
    const all = this.auth.getUsers();
    this.pendingUsers  = all.filter((u: User) => u.role !== 'student' && !u.approved && !u.rejected);
    this.rejectedUsers = all.filter((u: User) => u.role !== 'student' &&  u.rejected);
  }

  approve(id: string): void {
    this.ui.confirm('Onaylamak istediğinize emin misiniz?').then(r => {
      if (r.isConfirmed) {
        this.auth.approveUser(id);
        this.load();
        this.ui.alert('Onaylandı!', 'success');
      }
    });
  }

  reject(id: string): void {
    this.ui.confirm(
      'Reddetmek istediğinize emin misiniz?',
      'Bu kullanıcı sisteme giriş yapamayacak.',
      'Evet, reddet',
      'Vazgeç',
      'warning'
    ).then(r => {
      if (r.isConfirmed) {
        this.auth.rejectUser(id);
        this.load();
        this.ui.alert('Reddedildi', 'error');
      }
    });
  }

  undoReject(id: string): void {
    this.ui.confirm(
      'Reddetmeyi geri al?',
      'Başvuru tekrar bekleyenler listesine taşınacak.',
      'Evet, geri al'
    ).then(r => {
      if (r.isConfirmed) {
        const users = this.auth.getUsers();
        const i = users.findIndex((u: User) => u.id === id);
        if (i > -1) {
          users[i].rejected = false;
          users[i].approved = false;
          localStorage.setItem('users', JSON.stringify(users));
          this.load();
          this.ui.alert('Geri alındı', 'success');
        }
      }
    });
  }

  trackById(_i: number, u: User) { return u.id; }
}
