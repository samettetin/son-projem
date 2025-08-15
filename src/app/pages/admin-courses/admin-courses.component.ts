import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CourseService } from 'src/app/services/course.service';
import { EnrollmentService } from 'src/app/services/enrollment.service';
import { User } from 'src/app/models/user';
import { Course } from 'src/app/models/course';

@Component({
  selector: 'app-admin-courses',
  templateUrl: './admin-courses.component.html',
  styles: [`
    .container { max-width: 1100px; margin: 16px auto; }
    .muted { color:#6b7280; }
    .filters { display:flex; gap:8px; margin:12px 0; }
    .list { display:grid; gap:12px; }
    .item { padding:12px; border:1px solid #e5e7eb; border-radius:12px; background:#fff; }
    .row { display:flex; gap:12px; align-items:center; justify-content:space-between; }
    .row.info { color:#374151; font-size:14px; justify-content:flex-start; gap:24px; }
    .title { display:flex; flex-direction:column; }
    .actions button { padding:6px 10px; border:1px solid #0f172a; border-radius:8px; background:#fff; cursor:pointer; }
    .desc { color:#111827; margin-top:8px; }
    input, select { border:1px solid #e5e7eb; border-radius:10px; padding:8px; }

    /* --- Modal (uyumlu görünüm) --- */
    .overlay{position:fixed;inset:0;background:rgba(15,23,42,.36);backdrop-filter:saturate(180%) blur(2px);z-index:40}
    .modal{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:41;padding:16px}
    .dialog{width:720px;max-width:95vw;background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 10px 40px rgba(2,6,23,.2);display:flex;flex-direction:column}
    .modal-head{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #e5e7eb}
    .modal-body{padding:12px 16px}
    .modal-foot{padding:12px 16px;border-top:1px solid #e5e7eb;display:flex;align-items:center;gap:8px}
    .x{border:none;background:transparent;font-size:22px;cursor:pointer}
    .pill{background:#eef2ff;color:#4338ca;border:1px solid #c7d2fe;border-radius:999px;padding:1px 8px;font-size:12px}
    .picker{margin-top:8px}
    .picklist{max-height:320px;overflow:auto;border:1px solid #e5e7eb;border-radius:12px;padding:6px;background:#fafafa}
    .pick{display:flex;align-items:center;gap:10px;padding:8px;border-radius:10px;cursor:pointer;background:#fff;border:1px solid transparent;margin:6px 4px}
    .pick:hover{border-color:#d1d5db}
    .avatar{width:32px;height:32px;border-radius:999px;background:#e5e7eb;display:flex;align-items:center;justify-content:center}
    .meta{flex:1}
    .name{font-weight:600}
    .sub{font-size:12px;color:#6b7280}
    .role{font-size:12px;color:#111827;border:1px solid #e5e7eb;border-radius:999px;padding:2px 8px}
    .sel{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60%}
    .gap{flex:1}
    .chip{border:1px solid #e5e7eb;border-radius:999px;padding:4px 10px;font-size:12px;background:#f8fafc;cursor:pointer}
    .chip + .chip{margin-left:6px}
    .mono{font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;}
  `]
})
export class AdminCoursesComponent implements OnInit {
  me: User | null = null;
  courses: Course[] = [];
  q = '';
  orgFilter = '';

  // modal state
  showIns = false;
  showOrg = false;
  targetCourse: Course | null = null;

  // instructor picker
  insQ = '';
  selectedInsId = '';
  instructors: User[] = [];

  // org picker
  orgInput = '';
  orgSuggestions: string[] = [];

  constructor(
    private auth: AuthService,
    private coursesvc: CourseService,
    private enrolls: EnrollmentService
  ) {}

  ngOnInit(): void {
    this.me = this.auth.getCurrentUser();
    this.load();
    this.refreshInstructors();
  }

  /* ===== data ===== */
  private getAllCourses(): Course[] {
    try { return (this.coursesvc as any).list?.() ?? []; }
    catch { return JSON.parse(localStorage.getItem('courses') || '[]'); }
  }

  private writeAll(arr: Course[]) {
    try { (this.coursesvc as any).write ? (this.coursesvc as any).write(arr) : localStorage.setItem('courses', JSON.stringify(arr)); }
    catch { localStorage.setItem('courses', JSON.stringify(arr)); }
  }

  private updateCourse(courseId: string, patch: Partial<Course>) {
    try {
      if ((this.coursesvc as any).update) { (this.coursesvc as any).update(courseId, patch); }
      else {
        const arr = this.getAllCourses();
        const i = arr.findIndex((c: any) => c.id === courseId);
        if (i > -1) { arr[i] = { ...arr[i], ...patch }; this.writeAll(arr); }
      }
    } catch {
      const arr = this.getAllCourses();
      const i = arr.findIndex((c: any) => c.id === courseId);
      if (i > -1) { arr[i] = { ...arr[i], ...patch }; this.writeAll(arr); }
    }
  }

  load() {
    const all = this.getAllCourses();
    let filtered = all;
    if (this.me && !['admin', 'superadmin'].includes(this.me.role)) {
      filtered = filtered.filter(c => !this.me?.orgId || c.orgId === this.me?.orgId);
    }
    if (this.orgFilter) filtered = filtered.filter(c => c.orgId === this.orgFilter);
    if (this.q) {
      const qq = this.q.toLowerCase();
      filtered = filtered.filter(c =>
        (c.title || '').toLowerCase().includes(qq) ||
        (c.description || '').toLowerCase().includes(qq) ||
        (c.id || '').toLowerCase().includes(qq)
      );
    }
    this.courses = filtered.sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''));
    this.refreshOrgSuggestions();
  }

  orgs(): string[] { return this.orgSuggestions; }

  instructorName(c: Course): string {
    if (!c.instructorId) return '-';
    const u = this.auth.getUsers().find(x => x.id === c.instructorId);
    return u ? `${u.fullName} (${u.email})` : c.instructorId;
  }

  studentCount(c: Course): number {
    try { const list = (this.enrolls as any).list?.() ?? []; return list.filter((e: any) => e.courseId === c.id).length; }
    catch { return 0; }
  }

  /* ===== instructors & orgs ===== */
  refreshInstructors() {
    const all = this.auth.getUsers();
    // admin her org'dan görelim; isterseniz sadece onaylıları gösteriyoruz
    this.instructors = all.filter(u => u.role === 'instructor' && u.approved);
  }

  refreshOrgSuggestions() {
    const set = new Set<string>();
    // kurslardan
    this.getAllCourses().forEach(c => c.orgId && set.add(c.orgId));
    // kullanıcıların org'larından
    this.auth.getUsers().forEach(u => u.orgId && set.add(u.orgId));
    this.orgSuggestions = Array.from(set);
  }

  /* ===== actions ===== */
  openInstructor(c: Course){
    this.targetCourse = c; this.selectedInsId = ''; this.insQ = ''; this.showIns = true;
  }

  filteredInstructors(): User[] {
    const q = this.insQ.trim().toLowerCase();
    const arr = this.instructors;
    if (!q) return arr;
    return arr.filter(u => (u.fullName||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q));
  }

  confirmInstructor(){
    if (!this.targetCourse || !this.selectedInsId) return;
    this.updateCourse(this.targetCourse.id, { instructorId: this.selectedInsId });
    this.closeModals(); this.load();
  }

  openOrg(c: Course){
    this.targetCourse = c; this.orgInput = c.orgId || ''; this.showOrg = true; this.refreshOrgSuggestions();
  }

  chooseOrg(v: string){ this.orgInput = v; }

  confirmOrg(){
    if (!this.targetCourse) return;
    const v = (this.orgInput || '').trim();
    this.updateCourse(this.targetCourse.id, { orgId: v || undefined });
    this.closeModals(); this.load();
  }

  togglePublish(c: Course) {
    const next = !c.published;
    this.updateCourse(c.id, { published: next });
    this.load();
  }

  closeModals(){ this.showIns = false; this.showOrg = false; this.targetCourse = null; }
}
