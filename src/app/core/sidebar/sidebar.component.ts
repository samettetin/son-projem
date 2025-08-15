import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  constructor(private auth: AuthService) {}

  get currentUser(): User | null {
    return this.auth.getCurrentUser();
  }

  get isAdminLike(): boolean {
    const r = this.currentUser?.role;
    return !!r && r !== 'student';
  }
}
