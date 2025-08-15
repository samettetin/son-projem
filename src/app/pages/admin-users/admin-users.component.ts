import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User, Role } from '../../models/user';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  q = '';
  role: '' | Role = '';

  constructor(private auth: AuthService) {}

  ngOnInit(): void { this.load(); }

  load() {
    const all = this.auth.getUsers();
    this.users = all.filter(u => u.approved && !u.rejected);
  }

  filter(u: User): boolean {
    const qq = this.q.trim().toLowerCase();
    const okQ = !qq || (u.fullName?.toLowerCase().includes(qq) || u.email?.toLowerCase().includes(qq) || u.id.includes(qq));
    const okR = !this.role || u.role === this.role;
    return okQ && okR;
  }

  copyId(u: User) {
    navigator.clipboard.writeText(u.id);
    alert('ID kopyalandı: ' + u.id);
  }

  exportCsv() {
    const rows = [['id','fullName','email','role','orgId','approved']].concat(
      this.users.filter(u => this.filter(u)).map(u => [u.id, u.fullName, u.email, u.role, u.orgId || '', String(!!u.approved)])
    );
    const csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'users.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  trackById(_i: number, u: User) { return u.id; }
}
