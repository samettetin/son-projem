import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CourseService } from 'src/app/services/course.service';
import { EnrollmentService } from 'src/app/services/enrollment.service';

import { User } from 'src/app/models/user';
import { Course } from 'src/app/models/course';
import { Enrollment } from 'src/app/models/enrollment';
import { Router } from '@angular/router';

type MyEnrollment = Enrollment & { course?: Course };

@Component({
  selector: 'app-dashboard-student',
  templateUrl: './dashboard-student.component.html',
  styleUrls: ['./dashboard-student.component.scss']
})
export class DashboardStudentComponent implements OnInit {
  me!: User;
  myEnrollments: MyEnrollment[] = [];
  recommended: Course[] = [];

  activeTab: 'mine' | 'rec' = 'mine';

  constructor(
    public auth: AuthService,
    private courses: CourseService,
    private enrolls: EnrollmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // demo kursları yoksa oluştur
    this.courses.seedIfEmpty();

    const u = this.auth.getCurrentUser();
    if (!u) return;
    this.me = u;

    this.loadMine();
    this.loadRecommended();
  }

  private loadMine() {
    const list = this.enrolls.listByUser(this.me.id);
    const dict = new Map(this.courses.list().map(c => [c.id, c]));
    this.myEnrollments = list.map(e => ({ ...e, course: dict.get(e.courseId) }));
  }

  private loadRecommended() {
    // En popüler ilk 5 kurs, hâlâ kayıtlı değilse öner ve org'a göre filtrele
    const mineIds = new Set(this.myEnrollments.map(m => m.courseId));
    const orgId = this.me.orgId;
    const list = orgId ? this.courses.listForOrg(orgId) : this.courses.list();
    this.recommended = list.filter(c => !mineIds.has(c.id)).slice(0, 5);
  }

  enroll(courseId: string) {
    this.enrolls.enroll(this.me.id, courseId);
    this.loadMine();
    this.loadRecommended();
  }

  continueCourse(eid: string) {
    // demo: ilerlemeyi arttır, kurs detayına götür
    this.enrolls.bumpProgress(eid, 15);
    this.loadMine();
  }

  openCourse(courseId: string) {
    this.router.navigate(['/course', courseId]);
  }

  trackById(_i: number, item: { id: string }) { return item.id; }
}
