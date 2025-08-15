import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from 'src/app/services/course.service';
import { Course, CourseActivity } from 'src/app/models/course';
import { EnrollmentService } from 'src/app/services/enrollment.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';
import { Enrollment, ActivityProgress } from 'src/app/models/enrollment';
import { LiveService } from 'src/app/services/live.service';
import { Observable, Subscription } from 'rxjs';
import { CertificateService, CertificateTemplate } from 'src/app/services/certificate.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UiService } from 'src/app/services/ui.service';
import { GamificationService } from 'src/app/services/gamification.service';
import { DependencyService, DependencyFlow, DependencyNode } from 'src/app/services/dependency.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent implements OnInit, OnDestroy {
  course?: Course;
  currentUser: User | null = null;
  enrollment: Enrollment | undefined;
  isEnrolled = false;
  activeUsersCount = 0;
  activityFeed: Observable<any[]>;
  private liveServiceSub?: Subscription;

  // Bağımlılık akış şeması
  showDependencyChart = false;
  dependencyFlow: DependencyFlow = { nodes: [], connections: [] };
  flowWidth = 800;
  flowHeight = 600;

  // Öğrenme yolu ve tahminler
  estimatedCompletion = {
    totalHours: 0,
    remainingHours: 0,
    estimatedWeeks: 0,
    canStart: false,
    missingPrerequisites: [] as string[]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cs: CourseService,
    private enrolls: EnrollmentService,
    private auth: AuthService,
    private live: LiveService,
    private certs: CertificateService,
    private notify: NotificationService,
    private ui: UiService,
    private gamification: GamificationService,
    private dependency: DependencyService
  ) {
    this.activityFeed = this.live.getActivityFeed();
  }

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    const id = this.route.snapshot.paramMap.get('id')!;
    this.course = this.cs.get(id);

    if (this.course && this.currentUser) {
      // org guard
      if (this.course.orgId && this.currentUser.orgId && this.course.orgId !== this.currentUser.orgId && this.currentUser.role !== 'superadmin' && this.currentUser.role !== 'admin'){
        this.ui.alert('Bu kurs farklı bir organizasyona ait.', 'warning');
        this.router.navigateByUrl('/courses');
        return;
      }
      this.enrollment = this.enrolls.listByUser(this.currentUser.id).find(e => e.courseId === this.course!.id);
      this.isEnrolled = !!this.enrollment;

      // Simulate user presence in this course
      this.live.toggleUserPresence(this.course.id, this.currentUser.id, true);
      this.liveServiceSub = this.live.getActivityFeed().subscribe(() => {
        this.activeUsersCount = this.live.getActiveUsers(this.course!.id);
      
    try{ this.certTpl = this.certs.getTemplate(this.course?.id||'default'); }catch{}
  });

      // Öğrenme yolu ve tahminleri hesapla
      this.calculateEstimatedCompletion();
    }
  }

  ngOnDestroy(): void {
    if (this.course && this.currentUser) {
      // org guard
      if (this.course.orgId && this.currentUser.orgId && this.course.orgId !== this.currentUser.orgId && this.currentUser.role !== 'superadmin' && this.currentUser.role !== 'admin'){
        this.ui.alert('Bu kurs farklı bir organizasyona ait.', 'warning');
        this.router.navigateByUrl('/courses');
        return;
      }
      this.live.toggleUserPresence(this.course.id, this.currentUser.id, false);
    }
    this.liveServiceSub?.unsubscribe();
  }

  /** Öğrenme yolu ve tahminleri hesapla */
  private calculateEstimatedCompletion(): void {
    if (!this.course || !this.currentUser) return;

    const completedCourseIds = this.getCompletedCourseIds();
    this.estimatedCompletion = this.dependency.estimateCompletionTime(this.course.id, completedCourseIds);
  }

  /** Tamamlanan kurs ID'lerini getir */
  private getCompletedCourseIds(): string[] {
    if (!this.currentUser) return [];
    
    const enrollments = this.enrolls.listByUser(this.currentUser.id);
    return enrollments
      .filter(e => e.progress === 100)
      .map(e => e.courseId);
  }

  /** Ön koşul kurs başlığını getir */
  getPrerequisiteTitle(prereqId: string): string {
    const prereqCourse = this.cs.get(prereqId);
    return prereqCourse?.title || 'Bilinmeyen Kurs';
  }

  /** Ön koşul kurs tamamlandı mı? */
  isPrerequisiteCompleted(prereqId: string): boolean {
    return this.getCompletedCourseIds().includes(prereqId);
  }

  /** Ön koşullar nedeniyle kayıt yapılamıyor mu? */
  get canEnrollDueToPrerequisites(): boolean {
    if (!this.course?.prerequisites || this.course.prerequisites.length === 0) return true;
    return this.course.prerequisites.every(prereqId => this.isPrerequisiteCompleted(prereqId));
  }

  /** Bağımlılık akış şemasını göster */
  showDependencyFlow(): void {
    if (!this.course || !this.currentUser) return;

    const completedCourseIds = this.getCompletedCourseIds();
    this.dependencyFlow = this.dependency.createDependencyFlow(this.course.id, completedCourseIds);
    this.showDependencyChart = true;

    // SVG boyutlarını ayarla
    this.adjustSvgDimensions();
  }

  /** SVG boyutlarını ayarla */
  private adjustSvgDimensions(): void {
    if (this.dependencyFlow.nodes.length === 0) return;

    const minX = Math.min(...this.dependencyFlow.nodes.map(n => n.position.x));
    const maxX = Math.max(...this.dependencyFlow.nodes.map(n => n.position.x));
    const minY = Math.min(...this.dependencyFlow.nodes.map(n => n.position.y));
    const maxY = Math.max(...this.dependencyFlow.nodes.map(n => n.position.y));

    this.flowWidth = Math.max(800, maxX - minX + 300);
    this.flowHeight = Math.max(600, maxY - minY + 300);
  }

  /** Bağlantı path'i oluştur */
  createConnectionPath(fromId: string, toId: string): string {
    const fromNode = this.dependencyFlow.nodes.find(n => n.id === fromId);
    const toNode = this.dependencyFlow.nodes.find(n => n.id === toId);
    
    if (!fromNode || !toNode) return '';

    return this.dependency.createConnectionPath(fromNode.position, toNode.position);
  }

  /** Düğüm CSS sınıflarını getir */
  getNodeClasses(node: DependencyNode): string {
    const classes = ['node'];
    if (node.completed) classes.push('completed');
    else if (node.canAccess) classes.push('accessible');
    else classes.push('locked');
    return classes.join(' ');
  }

  enrollOrContinue(): void {
    if (!this.currentUser) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (!this.canEnrollDueToPrerequisites) {
      this.ui.alert('Bu kursa kaydolmak için ön koşul kursları tamamlamanız gerekiyor.', 'warning');
      return;
    }

    if (!this.isEnrolled) {
      this.enrollment = this.enrolls.enroll(this.currentUser.id, this.course!.id);
      this.isEnrolled = true;
      this.notify.notify(`"${this.course!.title}" kursuna kaydoldunuz!`, 'success');
      this.live.addActivity(`${this.currentUser.fullName} "${this.course!.title}" kursuna kaydoldu.`);
    }

    // Simulate continuing the course
    this.ui.toast('Kursa devam ediliyor...', 'info');
  }

  getEnrollmentActivity(activityId: string): ActivityProgress | undefined {
    return this.enrollment?.activities.find(a => a.id === activityId);
  }

  async completeActivity(activityId: string, durationMinutes?: number, questions?: { question: string; options: string[]; answer: number }[]): Promise<void> {
    if (!this.enrollment) return;

    let score: number | undefined;
    if (questions && questions.length > 0) {
      // Simulate quiz
      const { value: formValues } = await Swal.fire({
        title: 'Quiz',
        html: questions.map((q, i) => `
          <p>${i + 1}. ${q.question}</p>
          ${q.options.map((opt, j) => `<input type="radio" name="q${i}" value="${j}" id="q${i}o${j}"><label for="q${i}o${j}">${opt}</label><br>`).join('')}
        `).join('<hr>'),
        focusConfirm: false,
        preConfirm: () => {
          const answers: number[] = [];
          questions.forEach((q, i) => {
            const selected = document.querySelector(`input[name="q${i}"]:checked`) as HTMLInputElement;
            answers.push(selected ? parseInt(selected.value) : -1);
          });
          return answers;
        }
      });

      if (formValues) {
        let correctCount = 0;
        formValues.forEach((ans: number, i: number) => {
          if (ans === questions[i].answer) {
            correctCount++;
          }
        });
        score = Math.round((correctCount / questions.length) * 100);
        this.ui.toast(`Quiz tamamlandı! Puanınız: ${score}`, score >= 50 ? 'success' : 'error');
      } else {
        return; // User cancelled quiz
      }
    }

    this.enrolls.toggleActivity(this.enrollment.id, activityId, true, score, durationMinutes);
    this.enrollment = this.enrolls.get(this.enrollment.id); // Refresh enrollment data
    this.notify.notify(`"${this.course!.title}" kursunda bir aktivite tamamlandı!`, 'info');
    this.live.addActivity(`${this.currentUser?.fullName} "${this.course!.title}" kursunda bir aktiviteyi tamamladı.`);

    // Gamification kontrolü
    if (this.currentUser) {
      if (questions && score) {
        this.gamification.checkForBadges(this.currentUser, 'quiz_completed', { score, courseId: this.course!.id });
      }
    }

    if (this.enrollment?.progress === 100) {
      this.ui.toast('Tebrikler! Kursu tamamladınız!', 'success');
      this.notify.notify(`Tebrikler! ${this.currentUser?.fullName} "${this.course!.title}" kursunu tamamladı!`, 'success', 'Kurs Tamamlandı!');
      
      // Gamification - kurs tamamlama
      if (this.currentUser) {
        this.gamification.checkForBadges(this.currentUser, 'course_completed', { courseId: this.course!.id, score: this.enrollment.totalPoints });
        this.gamification.updateUserLevel(this.currentUser, this.course, this.enrollment.totalPoints);
      }

      if (this.course?.certificateType) {
        this.certs.generate(this.currentUser!, this.course);
        this.ui.alert('Sertifikanız hazır!', 'success');
        this.live.addActivity(`${this.currentUser?.fullName} "${this.course!.title}" kursu için sertifika aldı.`);
      }
    }
  }

  viewCertificate(): void {
    if (this.currentUser && this.course) {
      const cert = this.certs.listByUser(this.currentUser.id).find(c => c.courseId === this.course!.id);
      if (cert) {
        Swal.fire({
          title: 'Sertifika',
          html: `
            <p><strong>Adı Soyadı:</strong> ${cert.username || 'Bilinmeyen Kullanıcı'}</p>
            <p><strong>Kurs:</strong> ${cert.courseTitle || 'Bilinmeyen Kurs'}</p>
            <p><strong>Tarih:</strong> ${new Date(cert.issuedAt).toLocaleDateString()}</p>
            <p><strong>Doğrulama Kodu:</strong> ${cert.qr}</p>
            <p><small>Bu bir simülasyon sertifikasıdır.</small></p>
          `,
          icon: 'success',
          confirmButtonText: 'Kapat'
        });
      } else {
        this.ui.alert('Sertifika bulunamadı.', 'error');
      }
    }
  }


  // Aktiviteleri modül sırasına göre kilitle: bir sonrakine geçmek için bir öncekini tamamla
  isUnlocked(activityId: string): boolean {
    if (!this.course || !this.enrollment) return true;
    // Kurs aktivitelerini düz bir liste haline getir
    const flat: {id:string; required:boolean}[] = [];
    this.course.modules?.forEach(m => m.activities?.forEach(a => flat.push({ id:a.id, required: !!a.required })));
    const idx = flat.findIndex(x => x.id === activityId);
    if (idx <= 0) return true;
    // Önceki required aktiviteler tamamlanmış mı?
    for (let i = 0; i < idx; i++){
      if (flat[i].required){
        const ap = this.getEnrollmentActivity(flat[i].id);
        if (!ap || !ap.completed) return false;
      }
    }
    return true;
  }

  certTpl: CertificateTemplate = 'elegant';

  saveTpl(){ try{ this.certs.setTemplate(this.course?.id||'default', this.certTpl); }catch{} }
}
