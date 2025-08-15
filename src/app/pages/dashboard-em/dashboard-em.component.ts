import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CourseService } from 'src/app/services/course.service';
import { InviteService } from 'src/app/services/invite.service';
import { EnrollService } from 'src/app/services/enroll.service';
import { User } from 'src/app/models/user';
import { Course, CourseModule } from 'src/app/models/course';

@Component({
  selector: 'app-dashboard-em',
  template: `
  <main class="container">
    <h2>Education Manager Paneli</h2>
    <p class="muted">Kendi organizasyonun için kurs oluştur, eğitmen ata, öğrenci ata/davet et.</p>

    <!-- KURS KABUĞU -->
    <section class="card">
      <h3>Kurs Kabuğu Oluştur</h3>
      <div class="grid">
        <input [(ngModel)]="title" placeholder="Başlık" />
        <input [(ngModel)]="desc" placeholder="Açıklama" />
        <select [(ngModel)]="level">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <input type="number" [(ngModel)]="hours" placeholder="Tahmini Saat" />
      </div>
      <button class="btn" (click)="createCourse()">Kursu Oluştur</button>
      <small class="muted" *ngIf="msg">{{msg}}</small>
    </section>

    <!-- KURSLARIM -->
    <section class="card" *ngIf="mine.length">
      <h3>Kurslarım (Org: {{me?.orgId || '-'}})</h3>
      <div class="list">
        <div class="item" *ngFor="let c of mine; trackBy: trackById">
          <div class="row">
            <div>
              <b>{{c.title}}</b> <small class="muted">#{{c.id}}</small>
              <div class="muted">{{c.description}}</div>
            </div>
            <div class="actions">
              <button class="btn" (click)="openAssignInstructor(c)">Eğitmen Ata</button>
              <button class="btn" (click)="openAssignStudent(c)">Öğrenci Ata</button>
              <button class="btn ghost" (click)="openBulkInvite(c)">CSV Davet</button>
            </div>
          </div>
          <div class="row info">
            <div><b>Org:</b> {{c.orgId || '-'}}</div>
            <div><b>Modüller:</b> {{c.modules?.length || 0}}</div>
            <div><b>Yayın:</b> {{ c?.published ? 'Açık' : 'Kapalı' }}</div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- ===== Modals ===== -->

  <!-- Eğitmen Ata Modal -->
  <div class="overlay" *ngIf="showAssignInstructor" (click)="closeModals()"></div>
  <div class="modal" *ngIf="showAssignInstructor">
    <div class="modal-head">
      <h3>Eğitmen Ata</h3>
      <button class="x" (click)="closeModals()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="muted">Kurs: <b>{{targetCourse?.title}}</b> <small>#{{targetCourse?.id}}</small></div>

      <div class="picker">
        <input [(ngModel)]="insQ" placeholder="Eğitmen ara: ad veya email" />
        <div class="list picklist">
          <div class="row pick" *ngFor="let u of filteredInstructors()" (click)="selectInstructor(u)" [class.sel]="u.id===selectedInsId">
            <div class="avatar">{{u.fullName?.charAt(0) || 'E'}}</div>
            <div class="meta">
              <div class="name">{{u.fullName}}</div>
              <div class="sub">{{u.email}}</div>
            </div>
            <div class="role">instructor</div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn" [disabled]="!selectedInsId" (click)="confirmAssignInstructor()">Ata</button>
      <button class="btn ghost" (click)="closeModals()">İptal</button>
    </div>
  </div>

  <!-- Öğrenci Ata Modal -->
  <div class="overlay" *ngIf="showAssignStudent" (click)="closeModals()"></div>
  <div class="modal" *ngIf="showAssignStudent">
    <div class="modal-head">
      <h3>Öğrenci Ata</h3>
      <button class="x" (click)="closeModals()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="muted">Kurs: <b>{{targetCourse?.title}}</b> <small>#{{targetCourse?.id}}</small></div>

      <div class="picker">
        <input [(ngModel)]="stuQ" placeholder="Öğrenci ara: ad veya email" />
        <div class="list picklist">
          <div class="row pick" *ngFor="let u of filteredStudents()" (click)="selectStudent(u)" [class.sel]="u.id===selectedStuId">
            <div class="avatar">{{u.fullName?.charAt(0) || 'Ö'}}</div>
            <div class="meta">
              <div class="name">{{u.fullName}}</div>
              <div class="sub">{{u.email}}</div>
            </div>
            <div class="role">student</div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn" [disabled]="!selectedStuId" (click)="confirmAssignStudent()">Ata</button>
      <button class="btn ghost" (click)="closeModals()">İptal</button>
    </div>
  </div>

  <!-- CSV Davet Modal -->
  <div class="overlay" *ngIf="showBulkInvite" (click)="closeModals()"></div>
  <div class="modal" *ngIf="showBulkInvite">
    <div class="modal-head">
      <h3>CSV Davet</h3>
      <button class="x" (click)="closeModals()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="muted">Kurs: <b>{{targetCourse?.title}}</b></div>
      <textarea [(ngModel)]="csvText" rows="6" placeholder="email1@example.com, email2@example.com
veya satır satır e-posta listesi"></textarea>
    </div>
    <div class="modal-foot">
      <button class="btn" (click)="confirmBulkInvite()">Davet Oluştur</button>
      <button class="btn ghost" (click)="closeModals()">İptal</button>
    </div>
  </div>
  `,
  styles: [`
    .container{max-width:1000px;margin:16px auto}
    .muted{color:#6b7280}
    .card{border:1px solid #e5e7eb;border-radius:12px;padding:12px;margin:12px 0;background:#fff}
    .grid{display:grid;grid-template-columns:1fr 1fr 160px 160px;gap:8px}
    .list{display:grid;gap:10px}
    .item{border:1px solid #e5e7eb;border-radius:12px;padding:10px;background:#fff}
    .row{display:flex;justify-content:space-between;gap:12px;align-items:center}
    .info{color:#374151;font-size:14px;justify-content:flex-start;gap:24px}
    .actions .btn{margin-left:6px}
    .btn{padding:6px 10px;border:1px solid #0f172a;border-radius:8px;background:#fff;cursor:pointer}
    .btn.ghost{background:transparent}
    input, select, textarea{border:1px solid #e5e7eb;border-radius:10px;padding:8px}

    /* Modal */
    .overlay{position:fixed;inset:0;background:rgba(15,23,42,.36);backdrop-filter:saturate(180%) blur(2px);z-index:40}
    .modal{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:41}
    .modal > * { box-sizing: border-box }
    .modal .modal-head{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e5e7eb}
    .modal .x{border:none;background:transparent;font-size:22px;cursor:pointer}
    .modal .modal-body{padding:12px 0}
    .modal .modal-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:8px}
    .modal > div{width:680px;max-width:90vw;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:12px 16px;box-shadow:0 10px 40px rgba(2,6,23,.2)}
    .picker{margin-top:8px}
    .picklist{max-height:320px;overflow:auto;border:1px solid #e5e7eb;border-radius:12px;padding:6px;background:#fafafa}
    .pick{padding:8px;border-radius:10px;cursor:pointer;background:#fff;border:1px solid transparent;align-items:center}
    .pick:hover{border-color:#d1d5db}
    .pick.sel{border-color:#0f172a;background:#f1f5f9}
    .avatar{width:32px;height:32px;border-radius:999px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;margin-right:8px}
    .meta{flex:1}
    .name{font-weight:600}
    .sub{font-size:12px;color:#6b7280}
    .role{font-size:12px;color:#111827;border:1px solid #e5e7eb;border-radius:999px;padding:2px 8px}
    textarea{width:100%;resize:vertical}
  `]
})
export class DashboardEmComponent implements OnInit {
  me: User | null = null;
  mine: Course[] = [];

  // form
  title = ''; desc = ''; level: any = 'beginner'; hours = 8;
  msg = '';

  // modal state
  showAssignInstructor = false;
  showAssignStudent   = false;
  showBulkInvite      = false;
  targetCourse: Course | null = null;

  // pickers
  insQ = ''; stuQ = '';
  selectedInsId = '';
  selectedStuId = '';

  // data caches
  instructors: User[] = [];
  students: User[] = [];

  // csv invite
  csvText = '';

  constructor(
    private auth: AuthService,
    private courses: CourseService,
    private invite: InviteService,
    private enroll: EnrollService
  ) {}

  ngOnInit(): void {
    this.me = this.auth.getCurrentUser();
    this.loadMine();
    this.refreshPeople();
  }

  /* ===== Data helpers ===== */
  private listAll(): Course[] {
    try { return (this.courses as any).list?.() ?? []; }
    catch { return JSON.parse(localStorage.getItem('courses') || '[]'); }
  }
  private writeAll(arr: Course[]) {
    try { (this.courses as any).write ? (this.courses as any).write(arr) : localStorage.setItem('courses', JSON.stringify(arr)); }
    catch { localStorage.setItem('courses', JSON.stringify(arr)); }
  }
  private updateCourse(id: string, patch: Partial<Course>) {
    try {
      if ((this.courses as any).update) (this.courses as any).update(id, patch);
      else {
        const arr = this.listAll();
        const i = arr.findIndex(c => c.id === id);
        if (i>-1){ arr[i] = { ...arr[i], ...patch } as Course; this.writeAll(arr); }
      }
    } catch {
      const arr = this.listAll();
      const i = arr.findIndex(c => c.id === id);
      if (i>-1){ arr[i] = { ...arr[i], ...patch } as Course; this.writeAll(arr); }
    }
  }

  loadMine() {
    const all = this.listAll();
    const orgId = this.me?.orgId;
    this.mine = all.filter(c => !orgId || c.orgId === orgId);
  }

  refreshPeople() {
    const all = this.auth.getUsers();
    const orgId = this.me?.orgId;
    const sameOrg = (u: User) => !orgId || !u.orgId || u.orgId === orgId; // org atanmadıysa da gösterebiliriz

    this.instructors = all.filter(u => u.role === 'instructor' && sameOrg(u) && u.approved);
    this.students    = all.filter(u => u.role === 'student'    && sameOrg(u) && u.approved);
  }

  /* ===== Create course ===== */
  createCourse() {
    if (!this.me?.orgId) { this.msg = 'Önce orgId atanmalı (kullanıcı).'; return; }
    const id = (crypto as any).randomUUID ? (crypto as any).randomUUID() : 'C-' + Math.random().toString(36).slice(2,10);
    const now = new Date().toISOString();

    const defaultModules: CourseModule[] = [
      { id:'m-intro', name:'Giriş',        required:true,  order:1, activities:[] },
      { id:'m-mid',   name:'Orta Seviye',  required:false, order:2, activities:[] },
      { id:'m-adv',   name:'İleri Seviye', required:false, order:3, activities:[] },
      { id:'m-exam',  name:'Sınav',        required:true,  order:4, activities:[] },
    ];

    const newCourse: Course = {
      id, title: this.title || 'Yeni Kurs', description: this.desc || '',
      level: this.level || 'beginner', estimatedHours: Number(this.hours) || 8,
      tags: [], instructorId: '', createdAt: now, cover: '',
      modules: defaultModules, popularity: 0, orgId: this.me.orgId,
      prerequisites: [], certificateType: 'completion', instructorNotes: '', maxPoints: 0, difficulty: 1,
      published: false
    };

    const all = this.listAll();
    all.unshift(newCourse); this.writeAll(all);
    this.msg = 'Kurs oluşturuldu.';
    this.title = this.desc = ''; this.level = 'beginner'; this.hours = 8;
    this.loadMine();
  }

  /* ===== Assign INSTRUCTOR ===== */
  openAssignInstructor(c: Course){ this.targetCourse = c; this.selectedInsId=''; this.insQ=''; this.showAssignInstructor = true; }
  selectInstructor(u: User){ this.selectedInsId = u.id; }
  filteredInstructors(): User[]{
    const q = this.insQ.trim().toLowerCase();
    const arr = this.instructors;
    if (!q) return arr;
    return arr.filter(u => (u.fullName||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q));
  }
  confirmAssignInstructor(){
    if (!this.targetCourse || !this.selectedInsId) return;
    this.updateCourse(this.targetCourse.id, { instructorId: this.selectedInsId });
    this.closeModals(); this.loadMine();
  }

  /* ===== Assign STUDENT (enroll) ===== */
  openAssignStudent(c: Course){ this.targetCourse = c; this.selectedStuId=''; this.stuQ=''; this.showAssignStudent = true; }
  selectStudent(u: User){ this.selectedStuId = u.id; }
  filteredStudents(): User[]{
    const q = this.stuQ.trim().toLowerCase();
    const arr = this.students;
    if (!q) return arr;
    return arr.filter(u => (u.fullName||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q));
  }
  confirmAssignStudent(){
    if (!this.targetCourse || !this.selectedStuId) return;
    this.enroll.enroll(this.selectedStuId, this.targetCourse.id);
    this.closeModals();
  }

  /* ===== CSV Invite (optional) ===== */
  openBulkInvite(c: Course){ this.targetCourse = c; this.csvText=''; this.showBulkInvite = true; }
  confirmBulkInvite(){
    const text = this.csvText || '';
    const emails = text.split(/[\n,; ]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
    let ok = 0;
    for (const e of emails) { this.invite.generate(e, this.targetCourse?.id, this.me?.orgId || undefined); ok++; }
    alert(`${ok} davet oluşturuldu.`);
    this.closeModals();
  }

  /* ===== misc ===== */
  closeModals(){ this.showAssignInstructor=false; this.showAssignStudent=false; this.showBulkInvite=false; }
  trackById(_i:number, c:Course){ return c.id; }
}
