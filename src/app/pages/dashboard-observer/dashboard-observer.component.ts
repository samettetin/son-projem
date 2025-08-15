import { Component, OnInit } from '@angular/core';
import { LiveService } from 'src/app/services/live.service';
import { EnrollmentService } from 'src/app/services/enrollment.service';
import { CourseService } from 'src/app/services/course.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard-observer',
  template: `
  <div class="container">
    <h2>Observer Paneli</h2>
    <p class="muted">Genel istatistikler (okuma yetkisi). Sadece kendi organizasyonundaki metrikleri görürsün.</p>

    <section class="grid">
      <div class="card">
        <h3>Aktif Kullanıcı</h3>
        <div class="num">{{ active }}</div>
      </div>
      <div class="card">
        <h3>Ortalama Tamamlama</h3>
        <div class="num">{{ avgCompletion }}%</div>
      </div>
      <div class="card">
        <h3>Kayıtlı Öğrenciler</h3>
        <div class="num">{{ learnerCount }}</div>
      </div>
    </section>

    <section class="card">
      <h3>Aktivite Akışı</h3>
      <div class="row" *ngFor="let e of feed">
        <span class="pill">{{ e.at | date:'short' }}</span> <span>{{ e.text }}</span>
      </div>
    </section>
  </div>
  `,
  styles:[`
    .container{max-width:1000px;margin:16px auto}
    .muted{color:#6b7280}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:12px 0}
    .card{border:1px solid #e5e7eb;border-radius:12px;padding:12px;background:#fff}
    .num{font-size:28px;font-weight:700}
    .row{display:flex;gap:8px;align-items:center}
    .pill{background:#e5e7eb;border-radius:999px;padding:2px 8px;font-size:12px}
  `]
})
export class DashboardObserverComponent implements OnInit {
  active = 0; avgCompletion = 0; learnerCount = 0; feed:any[]=[];

  constructor(
    private live: LiveService,
    private enrolls: EnrollmentService,
    private courses: CourseService,
    private auth: AuthService
  ) {}

  ngOnInit(): void { this.refresh(); }

  private getOrgCourses(): string[] {
    const me = this.auth.getCurrentUser();
    const all = (this.courses as any).list?.() ?? JSON.parse(localStorage.getItem('courses') || '[]');
    if (me && me.orgId && !['admin','superadmin'].includes(me.role)) {
      return all.filter((c:any)=> c.orgId === me.orgId).map((c:any)=> c.id);
    }
    return all.map((c:any)=> c.id);
  }

  refresh(){
    const courseIds = this.getOrgCourses();
    this.active = this.live.getActiveCount();
    this.feed = this.live.getFeed();

    const list = (this.enrolls as any).list?.() ?? [];
    const mine = list.filter((e:any)=> courseIds.includes(e.courseId));

    this.learnerCount = new Set(mine.map((e:any)=> e.userId)).size;
    if (mine.length) {
      const avg = mine.map((e:any)=> e.progress || 0).reduce((a:number,b:number)=>a+b,0)/mine.length;
      this.avgCompletion = Math.round(avg);
    } else {
      this.avgCompletion = 0;
    }
  }
}
