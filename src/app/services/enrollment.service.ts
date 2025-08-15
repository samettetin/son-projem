import { Injectable } from '@angular/core';
import { Enrollment, ActivityProgress } from '../models/enrollment';
import { CourseService } from './course.service';
import { Course } from '../models/course';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private readonly LS = 'enrollments';

  constructor(private courses: CourseService) {}

  // --- storage helpers ---
  private read(): Enrollment[] {
    return JSON.parse(localStorage.getItem(this.LS) || '[]');
  }
  private write(list: Enrollment[]) {
    localStorage.setItem(this.LS, JSON.stringify(list));
  }

  // --- public api ---
  listByUser(userId: string): Enrollment[] {
    return this.read().filter(e => e.userId === userId);
  }

  get(id: string): Enrollment | undefined {
    return this.read().find(e => e.id === id);
  }

  enroll(userId: string, courseId: string): Enrollment {
    const all = this.read();

    // zaten kayıtlıysa direkt dön
    const exists = all.find(e => e.userId === userId && e.courseId === courseId);
    if (exists) return exists;

    // kurstan aktiviteleri çıkar
    const course = this.courses.get(courseId);
    const activities: ActivityProgress[] = this.cloneActivities(course);

    const item: Enrollment = {
      id: crypto.randomUUID(),
      userId,
      courseId,
      startedAt: new Date().toISOString(),
      activities,
      progress: this.calcProgress(activities)
    };
    all.push(item);
    this.write(all);
    return item;
  }

  /** İlerlemeyi belirli bir yüzde kadar arttır (demo amaçlı). 0–100 sınırında tutar. */
  bumpProgress(enrollmentId: string, delta: number): void {
    const all = this.read();
    const i = all.findIndex(e => e.id === enrollmentId);
    if (i < 0) return;
    const next = Math.max(0, Math.min(100, Math.round(all[i].progress + delta)));
    all[i].progress = next;
    // isterseniz belli eşiklerde activity tamamlatma simülasyonu da yapılabilir
    this.write(all);
  }

  /** Çalışma süresi ekle (dakika) */
  addTime(enrollmentId: string, minutes: number): void {
    const all = this.read();
    const i = all.findIndex(e => e.id === enrollmentId);
    if (i < 0) return;
    const prev = all[i].timeSpentMinutes || 0;
    all[i].timeSpentMinutes = prev + Math.max(0, Math.floor(minutes));
    this.write(all);
  }

  /** Tek bir aktiviteyi tamamla/geri al; progress otomatik hesaplanır. */
  toggleActivity(enrollmentId: string, activityId: string, completed: boolean, score?: number, durationMinutes?: number): void {
    const all = this.read();
    const i = all.findIndex(e => e.id === enrollmentId);
    if (i < 0) return;

    const act = all[i].activities.find(a => a.id === activityId);
    if (!act) return;

    act.completed = completed;
    act.completedAt = completed ? new Date().toISOString() : undefined;
    if (typeof score === 'number') act.score = score;
    if (typeof durationMinutes === 'number') act.timeSpent = durationMinutes;

    // Update total time spent for the enrollment (simulated)
    if (durationMinutes) {
      all[i].timeSpentMinutes = (all[i].timeSpentMinutes || 0) + durationMinutes;
    }

    all[i].progress = this.calcProgress(all[i].activities);
    this.write(all);
  }

  // --- helpers ---
  private cloneActivities(course?: Course): ActivityProgress[] {
    if (!course) return [];
    const list: ActivityProgress[] = [];
    for (const m of course.modules || []) {
      for (const a of m.activities || []) {
        list.push({
          id: a.id,
          type: a.type as any,
          title: a.title,
          completed: false
        });
      }
    }
    return list;
  }

  private calcProgress(acts: ActivityProgress[]): number {
    if (!acts.length) return 0;
    const done = acts.filter(a => a.completed).length;
    return Math.round((done / acts.length) * 100);
    // not: istersen type'a göre ağırlıklandırma yapmak istersen burada genişletebiliriz
  }
}
