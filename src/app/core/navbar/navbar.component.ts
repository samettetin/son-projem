import Swal from 'sweetalert2';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(
    public auth: AuthService,
    public router: Router,
    public theme: ThemeService
  ){}

  get currentUser(){ return this.auth.getCurrentUser?.() || null; }

  getRoleLabel(role: string){
    switch(role){
      case 'superadmin': return 'Sistem Yöneticisi';
      case 'educationmanager': return 'Eğitim Yöneticisi';
      case 'instructor': return 'Eğitmen';
      case 'observer': return 'Gözlemci';
      case 'student': return 'Öğrenci';
      default: return 'Ziyaretçi';
    }
  }

  setTheme(t: 'light'|'dark'|'focus'){ this.theme.set({ theme: t }); this.theme.apply(); }

  confirmLogout(){
    Swal.fire({
      title: 'Çıkış yapılsın mı?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Çıkış',
      cancelButtonText: 'İptal'
    }).then(r => { if (r.isConfirmed){ this.logout(); } });
  }

  logout(){ this.auth.logout(); this.router.navigate(['/']); }
}
