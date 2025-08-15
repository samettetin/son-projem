import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

import { OrgService } from 'src/app/services/org.service';
import { Organization } from 'src/app/models/organization';
import { AuthService } from 'src/app/services/auth.service';
import { InviteService, Invite } from 'src/app/services/invite.service';

@Component({
  selector: 'app-admin-organizations',
  templateUrl: './admin-organizations.component.html',
  styleUrls: ['./admin-organizations.component.scss']
})
export class AdminOrganizationsComponent implements OnInit {
  // Organizasyonlar
  orgs: Organization[] = [];
  name = '';
  description = '';

  // Davet formu (bağlı alanlar)
  invEmail = '';
  invCourseId = '';
  invOrgId = '';
  creatingInvite = false;
  msg = '';

  // Davet sonuçları
  last?: Invite;
  joinUrl = '';
  invites: Invite[] = [];

  constructor(
    private orgService: OrgService,
    private auth: AuthService,
    private invitesSvc: InviteService
  ) {}

  ngOnInit(): void {
    this.load();
    this.refreshInvites();
  }

  load(): void {
    this.orgs = this.orgService.getAll();
  }

  refreshInvites(): void {
    this.invites = this.invitesSvc.list();
  }

  private isEmail(v: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());
  }

  // Davet oluştur — parametre gelmezse bağlı alanları kullanır
  generateInvite(email?: string, courseId?: string, orgId?: string) {
    const e = (email ?? this.invEmail).trim().toLowerCase();
    const c = (courseId ?? this.invCourseId).trim();
    const o = (orgId ?? this.invOrgId).trim();

    this.msg = '';
    if (!this.isEmail(e)) {
      this.msg = 'Lütfen geçerli bir e-posta girin.';
      void Swal.fire('Geçersiz e-posta', 'Lütfen geçerli bir e-posta yazın.', 'warning');
      return;
    }

    this.creatingInvite = true;
    const inv = this.invitesSvc.generate(e, c || undefined, o || undefined);
    this.creatingInvite = false;

    this.last = inv;
    this.joinUrl = `${location.origin}/join/${inv.code}`;
    this.msg = 'Davet oluşturuldu. Kodu veya linki kullanıcıya gönderin.';
    this.refreshInvites();

    void Swal.fire('Davet oluşturuldu', `Kod: ${inv.code}`, 'success');
  }

  copy(text: string): void {
    navigator.clipboard.writeText(text);
    this.msg = 'Kopyalandı.';
    setTimeout(() => (this.msg = ''), 1500);
  }

  // CSV ile toplu kayıt
  onCsv(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const rows = text.split(/\r?\n/).map(r => r.trim()).filter(Boolean);
      if (!rows.length) return;

      const [header, ...body] = rows;
      const cols = header.split(',').map(c => c.trim());
      const idx = (k: string) => cols.indexOf(k);

      const users = this.auth.getUsers();
      let created = 0;

      for (const line of body) {
        const c = line.split(',');
        const user = {
          fullName: c[idx('fullName')]?.trim() || 'Ad Soyad',
          email: c[idx('email')]?.trim() || '',
          password: c[idx('password')]?.trim() || '123456',
          role: (c[idx('role')]?.trim() || 'student') as any,
          orgId: c[idx('orgId')]?.trim() || undefined,
          department: c[idx('department')]?.trim() || undefined
        } as any;

        if (user.email && !users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
          const res = this.auth.register(user);
          if (res?.ok) created++;
        }
      }

      void Swal.fire('Tamamlandı', `${created} kullanıcı eklendi (var olanlar atlandı).`, 'success');
    };
    reader.readAsText(file);
    // input temizle
    input.value = '';
  }

  async add(): Promise<void> {
    const name = this.name.trim();
    const description = this.description.trim();

    if (!name) { void Swal.fire('Ad gerekli', 'Organizasyon adı boş olamaz.', 'warning'); return; }

    // Aynı isimde var mı? (case-insensitive)
    const exists = this.orgs.some(o => o.name.toLowerCase() === name.toLowerCase());
    if (exists) { void Swal.fire('Zaten var', 'Bu isimde bir organizasyon mevcut.', 'info'); return; }

    const current = this.auth.getCurrentUser();
    this.orgService.create(name, description, current?.id);

    this.name = '';
    this.description = '';
    this.load();

    void Swal.fire('Eklendi', 'Organizasyon başarıyla oluşturuldu.', 'success');
  }

  delete(id: string): void {
    Swal.fire({
      title: 'Silinsin mi?',
      text: 'Bu organizasyonu silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, sil',
      cancelButtonText: 'Vazgeç',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#0f172a'
    }).then(res => {
      if (res.isConfirmed) {
        this.orgService.remove(id);
        this.load();
        void Swal.fire('Silindi', 'Organizasyon kaldırıldı.', 'success');
      }
    });
  }

  // Davetin ne yapacağını gösteren yardımcılar
  willEnroll(): boolean { return !!this.invCourseId; }
  willAssignOrg(): boolean { return !!this.invOrgId; }

  // *ngFor performansı
  trackById(_i: number, item: Organization) { return item.id; }
}
