import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CourseService } from 'src/app/services/course.service';
import { AuthService } from 'src/app/services/auth.service';
import { Course, CourseLevel, CourseModule } from 'src/app/models/course';
import { OrgService } from 'src/app/services/org.service';
import { LiveService } from 'src/app/services/live.service';
import { Organization } from 'src/app/models/organization';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-dashboard-instructor',
  templateUrl: './dashboard-instructor.component.html',
  styleUrls: ['./dashboard-instructor.component.scss']
})
export class DashboardInstructorComponent implements OnInit {
  me: User | null = null;

  // form state
  title = '';
  description = '';
  level: CourseLevel = 'beginner';
  estimatedHours = 6;
  tagsCsv = 'Teknik';
  cover = '';
  orgId: string | '' = '';
  orgs: Organization[] = [];
  certType: 'none'|'completion'|'qr' = 'none';
  prereqCsv = '';

  modules: CourseModule[] = [
    {
      id: 'mod-intro',
      name: 'Giriş',
      order: 1,
      minProgress: 0,
      passScore: 60,
      required: true,
      activities: [
        { id: 'intro-lesson', title: 'Hoş geldiniz', type: 'lesson', durationMinutes: 5, required: true }
      ]
    }
  ];

  myCourses: Course[] = [];

  // checklist (persisted in localStorage)
  tasks = [
    { id:'ins-build', text:'Kurs oluştur ve açıklamayı doldur', done:false },
    { id:'ins-modules', text:'Modülleri ve aktiviteleri ekle', done:false },
    { id:'ins-content', text:'Ders içeriklerini (lesson-view) yaz', done:false },
    { id:'ins-quiz', text:'Her modüle mini quiz ekle', done:false },
    { id:'ins-review', text:'Öğrenci ilerlemelerini gözden geçir', done:false }
  ];
  private LS='ins-tasks';

  constructor(public live: LiveService, 
    private courses: CourseService,
    public auth: AuthService,
    private orgService: OrgService
  ) {}

  ngOnInit(): void {
    const raw = localStorage.getItem(this.LS); 
    if (raw) this.tasks = JSON.parse(raw);

    this.me = this.auth.getCurrentUser();
    this.orgs = this.orgService.getAll();
    this.refresh();
  }

  toggleTask(t:any){ t.done=!t.done; localStorage.setItem(this.LS, JSON.stringify(this.tasks)); }

  private rid(prefix:string='id'): string {
    return prefix + '-' + Math.random().toString(36).slice(2,8);
  }

  refresh(): void {
    const all = this.courses.list();
    const myId = this.me?.id;
    this.myCourses = myId ? all.filter(c => c.instructorId === myId) : [];
  }

  addModule(): void {
    this.modules.push({ id: this.rid('mod'), name: 'Yeni Modül', required: false, minProgress: 0, passScore: 70, order: this.modules.length+1, activities: [] });
  }

  removeModule(i: number): void {
    this.modules.splice(i, 1);
  }

  drop(event: CdkDragDrop<CourseModule[]>) {
    moveItemInArray(this.modules, event.previousIndex, event.currentIndex);
  }

  createCourse(): void {
    if (!this.me) return;
    const tags = this.tagsCsv
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newCourse: Omit<Course, 'id' | 'createdAt' | 'popularity'> = {
      title: this.title.trim(),
      description: this.description.trim(),
      level: this.level,
      estimatedHours: Math.max(1, Number(this.estimatedHours) || 1),
      tags,
      instructorId: this.me.id,
      cover: this.cover.trim() || undefined,
      modules: this.modules.map(m => ({ ...m })),
      orgId: this.orgId || undefined,
      certificateType: this.certType,
      prerequisites: this.prereqCsv.split(',').map(x=>x.trim()).filter(Boolean)
    };

    if (!newCourse.title) return;
    this.courses.create(newCourse);

    // reset
    this.title = '';
    this.description = '';
    this.level = 'beginner';
    this.estimatedHours = 6;
    this.tagsCsv = 'Teknik';
    this.cover = '';
    this.modules = [
      { id: 'mod-intro', name: 'Giriş', order:1, minProgress:0, passScore:60, required:true, activities:[{ id:'intro-lesson', title:'Hoş geldiniz', type:'lesson', durationMinutes:5, required:true }]}
    ];
    this.orgId = '';
    this.certType = 'none';
    this.prereqCsv = '';

    this.refresh();
  }
}
