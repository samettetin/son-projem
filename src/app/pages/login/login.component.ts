import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  show = false;

  constructor(private auth: AuthService, private router: Router){}

  ngOnInit(): void {
    // Zaten girişliyse eve dön
    const u = this.auth.getCurrentUser?.();
    if (u) { this.router.navigateByUrl('/home'); }
  }

  onLogin(): void {
    const ok = this.auth.login(this.email, this.password);
    if (ok) {
      this.router.navigateByUrl('/home');
    } else {
      Swal.fire({ icon:'error', title:'Hata', text:'E-posta ya da şifre hatalı.' });
    }
  }
}
