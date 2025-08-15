import { Component, OnInit } from '@angular/core';
import { ThemeService } from './services/theme.service';
import { ContentService } from './services/content.service';
import { CourseService } from './services/course.service';
import { LearningPathService } from './services/learning-path.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private theme: ThemeService,
    private content: ContentService,
    private courses: CourseService,
    private lp: LearningPathService
  ) {}

  ngOnInit(): void {
    // Apply persisted theme on boot
    this.theme.apply();

    // Best-effort seeders (optional chaining keeps TS happy if methods don't exist)
    try {
      (this.content as any)?.ensureSeed?.();
      (this.courses as any)?.ensureSeed?.();
      (this.lp as any)?.ensureSeed?.();
    } catch {}
  }
}
