import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.scss']
})
export class DashboardAdminComponent implements OnInit {
  currentUser: User | null = null;
  users: User[] = [];
  pendingCount = 0;
  totals = { users: 0, students: 0 };

  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    this.refresh();
  }

  refresh(): void {
    this.users = this.auth.getUsers();
    this.pendingCount = this.users.filter(u => u.role !== 'student' && !u.approved).length;
    this.totals.users = this.users.length;
    this.totals.students = this.users.filter(u => u.role === 'student').length;
  }

  logout(): void {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      this.auth.logout();
      window.location.href = '/login';
    }
  }
}
