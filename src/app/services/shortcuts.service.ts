import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';

export interface Shortcut {
  key: string;
  description: string;
  action: () => void;
  category: 'navigation' | 'course' | 'general' | 'admin';
}

@Injectable({ providedIn: 'root' })
export class ShortcutsService {
  private shortcuts: Shortcut[] = [];
  private isEnabled = true;

  constructor(
    private router: Router,
    private notification: NotificationService,
    private ngZone: NgZone
  ) {
    this.initializeShortcuts();
    this.setupGlobalListener();
  }

  private initializeShortcuts(): void {
    this.shortcuts = [
      // Navigasyon kısayolları
      {
        key: 'g h',
        description: 'Ana sayfaya git',
        action: () => this.router.navigate(['/']),
        category: 'navigation'
      },
      {
        key: 'g c',
        description: 'Kurslara git',
        action: () => this.router.navigate(['/courses']),
        category: 'navigation'
      },
      {
        key: 'g d',
        description: 'Dashboard\'a git',
        action: () => this.router.navigate(['/dashboard-student']),
        category: 'navigation'
      },
      {
        key: 'g a',
        description: 'Admin paneline git',
        action: () => this.router.navigate(['/dashboard-admin']),
        category: 'navigation'
      },

      // Kurs kısayolları
      {
        key: 'c n',
        description: 'Yeni kurs oluştur (eğitmen)',
        action: () => this.router.navigate(['/dashboard-instructor']),
        category: 'course'
      },
      {
        key: 'c s',
        description: 'Kurs ara',
        action: () => {
          this.router.navigate(['/courses']);
          setTimeout(() => {
            const searchInput = document.querySelector('input[placeholder*="ara"]') as HTMLInputElement;
            if (searchInput) searchInput.focus();
          }, 100);
        },
        category: 'course'
      },
      {
        key: 'c f',
        description: 'Favori kursları göster',
        action: () => {
          // Favori kursları filtreleme simülasyonu
          this.notification.notify('Favori kurslar filtrelendi', 'info');
        },
        category: 'course'
      },

      // Genel kısayollar
      {
        key: '?',
        description: 'Kısayol yardımını göster',
        action: () => this.showShortcutsHelp(),
        category: 'general'
      },
      {
        key: 't',
        description: 'Tema değiştir',
        action: () => this.toggleTheme(),
        category: 'general'
      },
      {
        key: 's',
        description: 'Ayarları aç',
        action: () => this.openSettings(),
        category: 'general'
      },
      {
        key: 'n',
        description: 'Bildirimleri göster',
        action: () => this.showNotifications(),
        category: 'general'
      },

      // Admin kısayolları
      {
        key: 'a u',
        description: 'Kullanıcı onayları',
        action: () => this.router.navigate(['/admin-approval']),
        category: 'admin'
      },
      {
        key: 'a o',
        description: 'Organizasyon yönetimi',
        action: () => this.router.navigate(['/admin-organizations']),
        category: 'admin'
      },
      {
        key: 'a r',
        description: 'Raporları göster',
        action: () => this.router.navigate(['/admin-reports']),
        category: 'admin'
      }
    ];
  }

  private setupGlobalListener(): void {
    let keySequence = '';
    let keyTimeout: any;

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (!this.isEnabled) return;

      // Ctrl/Cmd + K ile kısayol yardımı
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        this.showShortcutsHelp();
        return;
      }

      // Escape ile kısayol modunu kapat
      if (event.key === 'Escape') {
        keySequence = '';
        if (keyTimeout) {
          clearTimeout(keyTimeout);
          keyTimeout = null;
        }
        return;
      }

      // Sadece harf ve rakam tuşları
      if (!/^[a-zA-Z0-9\s]$/.test(event.key)) return;

      keySequence += event.key.toLowerCase();
      
      // Kısayol eşleşmesini kontrol et
      const shortcut = this.shortcuts.find(s => s.key === keySequence);
      if (shortcut) {
        event.preventDefault();
        this.ngZone.run(() => {
          shortcut.action();
          this.notification.notify(`Kısayol: ${shortcut.description}`, 'info', 'Kısayol Çalıştı');
        });
        keySequence = '';
        return;
      }

      // 2 saniye sonra sıfırla
      if (keyTimeout) clearTimeout(keyTimeout);
      keyTimeout = setTimeout(() => {
        keySequence = '';
      }, 2000);
    });
  }

  /** Kısayol yardımını göster */
  private showShortcutsHelp(): void {
    const helpHtml = `
      <div style="text-align: left; max-width: 600px;">
        <h3>🎯 Klavye Kısayolları</h3>
        
        <h4>🚀 Navigasyon</h4>
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-bottom: 20px;">
          ${this.shortcuts
            .filter(s => s.category === 'navigation')
            .map(s => `<kbd>${s.key}</kbd><span>${s.description}</span>`)
            .join('')}
        </div>

        <h4>📚 Kurs İşlemleri</h4>
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-bottom: 20px;">
          ${this.shortcuts
            .filter(s => s.category === 'course')
            .map(s => `<kbd>${s.key}</kbd><span>${s.description}</span>`)
            .join('')}
        </div>

        <h4>⚙️ Genel</h4>
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-bottom: 20px;">
          ${this.shortcuts
            .filter(s => s.category === 'general')
            .map(s => `<kbd>${s.key}</kbd><span>${s.description}</span>`)
            .join('')}
        </div>

        <h4>👑 Admin</h4>
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-bottom: 20px;">
          ${this.shortcuts
            .filter(s => s.category === 'admin')
            .map(s => `<kbd>${s.key}</kbd><span>${s.description}</span>`)
            .join('')}
        </div>

        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          💡 İpucu: <kbd>Ctrl/Cmd + K</kbd> ile bu yardımı her zaman açabilirsiniz
        </p>
      </div>
    `;

    // SweetAlert2 ile yardım göster
    import('sweetalert2').then(({ default: Swal }) => {
      Swal.fire({
      title: 'Klavye Kısayolları',
      html: helpHtml,
      width: 700,
      confirmButtonText: 'Anladım',
      customClass: {
        popup: 'shortcuts-help-popup'
      }
    });
    });
  }

  /** Tema değiştir */
  private toggleTheme(): void {
    const currentTheme = document.body.className || 'light';
    const themes = ['light', 'dark', 'focus'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];

    document.body.className = nextTheme;
    localStorage.setItem('appTheme', nextTheme);
    
    this.notification.notify(`Tema değiştirildi: ${nextTheme}`, 'info', 'Tema Değişti');
  }

  /** Ayarları aç */
  private openSettings(): void {
    this.notification.notify('Ayarlar sayfası açılıyor...', 'info');
    // Gerçek uygulamada settings sayfasına yönlendir
  }

  /** Bildirimleri göster */
  private showNotifications(): void {
    this.notification.notify('Bildirimler gösteriliyor...', 'info');
    // Gerçek uygulamada bildirim panelini aç
  }

  /** Kısayolları etkinleştir/devre dışı bırak */
  toggleShortcuts(): void {
    this.isEnabled = !this.isEnabled;
    this.notification.notify(
      `Kısayollar ${this.isEnabled ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`,
      this.isEnabled ? 'success' : 'warning'
    );
  }

  /** Kısayol ekle */
  addShortcut(shortcut: Shortcut): void {
    this.shortcuts.push(shortcut);
  }

  /** Kısayol kaldır */
  removeShortcut(key: string): void {
    this.shortcuts = this.shortcuts.filter(s => s.key !== key);
  }

  /** Mevcut kısayolları getir */
  getShortcuts(): Shortcut[] {
    return [...this.shortcuts];
  }
}

  private initDefaults(){
    this.addShortcut({ key:'g c', description:'Kurslara git', category:'navigation', action:()=> this.router.navigateByUrl('/courses') });
    this.addShortcut({ key:'g d', description:'Panel', category:'navigation', action:()=> this.router.navigateByUrl('/dashboard-student') });
    this.addShortcut({ key:'?', description:'Kısayolları göster', category:'general', action:()=> this.notify.info('Kısayollar: g c = Kurslar, g d = Panel, ? = Göster') });
  }
