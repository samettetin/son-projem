import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EnrollService {
  private readonly LS_KEY = 'enrollments'; // { userId: string, courseId: string }[]

  private list(): Array<{userId:string; courseId:string}> {
    return JSON.parse(localStorage.getItem(this.LS_KEY) || '[]');
  }

  isEnrolled(userId: string, courseId: string): boolean {
    return this.list().some(e => e.userId === userId && e.courseId === courseId);
  }

  enroll(userId: string, courseId: string): void {
    const all = this.list();
    if (!this.isEnrolled(userId, courseId)) {
      all.push({ userId, courseId });
      localStorage.setItem(this.LS_KEY, JSON.stringify(all));
    }
  }
}
