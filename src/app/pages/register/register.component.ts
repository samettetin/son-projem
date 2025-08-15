import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { getRoleLabel } from 'src/app/utils/role-label';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  role: 'student' | 'instructor' | 'educationmanager' | 'observer' = 'student';

  // Role seçimi için otomatik liste
  roles = [
    { value: 'student',           label: getRoleLabel('student') },
    { value: 'instructor',        label: getRoleLabel('instructor') },
    { value: 'educationmanager',  label: getRoleLabel('educationmanager') },
    { value: 'observer',          label: getRoleLabel('observer') }
  ];

  msg = '';
  ok = false;
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onRegister(): void {
    this.msg = '';
    this.ok = false;

    const fullName = (this.fullName || '').trim();
    const email    = (this.email || '').trim().toLowerCase();
    const password = this.password || '';
    const role     = this.role;

    if (!fullName || !email || !password) {
      this.msg = 'Lütfen tüm alanları doldurun.';
      return;
    }

    this.loading = true;
    const res = this.auth.register({
      fullName,
      email,
      password,
      role
    });
    this.loading = false;

    this.ok = res.ok;
    this.msg = res.message || (res.ok ? 'Kayıt başarılı' : 'Kayıt başarısız');

    if (!res.ok) return;

    // Güvenlik: parolayı hafızadan temizle
    this.password = '';

    if (role === 'student') {
      // Öğrenci ise: 2 sn sonra login'e gönder
      this.msg = 'Kayıt başarılı. 2 sn içinde giriş sayfasına yönlendirileceksiniz…';
      setTimeout(() => this.router.navigateByUrl('/login'), 2000);
    } else {
      // Diğer roller onay bekler: anasayfaya dön
      // (İstersen anasayfada göstermek için küçük bir mesaj bırakıyorum)
      localStorage.setItem('reg_info', 'Hesabınız admin onayına gönderildi.');
      this.router.navigateByUrl('/');
    }
  }
}
