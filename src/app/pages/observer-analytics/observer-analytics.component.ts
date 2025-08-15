import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { EnrollmentService } from 'src/app/services/enrollment.service';
import { CourseService } from 'src/app/services/course.service';
import { User } from 'src/app/models/user';

type Row = {
  user: User;
  enrollCount: number;
  avgProgress: number;
  totalMinutes: number;
  lastActive?: string;
};

@Component({
  selector: 'app-observer-analytics',
  templateUrl: './observer-analytics.component.html',
  styleUrls: ['./observer-analytics.component.scss']
})
export class ObserverAnalyticsComponent implements OnInit {
  rows: Row[] = [];
  sortKey: keyof Row = 'avgProgress';
  sortDir: 'asc'|'desc' = 'desc';

  constructor(private auth: AuthService, private enrolls: EnrollmentService, private courses: CourseService){}

  ngOnInit(): void {
    const me = this.auth.getCurrentUser?.();
    const users = this.auth.getUsers?.().filter((u:User) => u.role === 'student');
    const scoped = me?.orgId ? users.filter((u:User)=>u.orgId === me.orgId) : users;
    this.rows = (scoped||[]).map((u:User) => {
      const es = this.enrolls.listByUser(u.id);
      const count = es.length;
      const avg = count ? Math.round(es.reduce((s,e)=>s+(e.progress||0),0)/count) : 0;
      const mins = es.reduce((s,e)=> s + (e.timeSpentMinutes||0), 0);
      const last = es.map(e=>e.lastActivityAt||'').sort().pop();
      return { user: u, enrollCount: count, avgProgress: avg, totalMinutes: mins, lastActive: last };
    });
    this.sort('avgProgress');
  }

  sort(k: keyof Row){
    if (this.sortKey === k) this.sortDir = this.sortDir==='asc'?'desc':'asc';
    else { this.sortKey = k; this.sortDir = 'desc'; }
    const dir = this.sortDir==='asc' ? 1 : -1;
    this.rows.sort((a:any,b:any)=> (a[this.sortKey] > b[this.sortKey] ? 1 : -1)*dir);
  }
}
