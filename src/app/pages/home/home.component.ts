import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  user: User | null = null;

  constructor(private auth: AuthService) {
    this.user = this.auth.getCurrentUser();
  }

  get isAdmin(): boolean {
    return !!this.user && this.user.role === 'admin';
  }
}
