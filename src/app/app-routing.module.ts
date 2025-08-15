import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { CourseDetailComponent } from './pages/course-detail/course-detail.component';
import { DashboardStudentComponent } from './pages/dashboard-student/dashboard-student.component';
import { DashboardAdminComponent } from './pages/dashboard-admin/dashboard-admin.component';
import { DashboardInstructorComponent } from './pages/dashboard-instructor/dashboard-instructor.component';
import { DashboardObserverComponent } from './pages/dashboard-observer/dashboard-observer.component';
import { DashboardEmComponent } from './pages/dashboard-em/dashboard-em.component';
import { AdminOrganizationsComponent } from './pages/admin-organizations/admin-organizations.component';
import { AdminReportsComponent } from './pages/admin-reports/admin-reports.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { ObserverAnalyticsComponent } from './pages/observer-analytics/observer-analytics.component';
import { InviteComponent } from './pages/invite/invite.component';
import { JoinComponent } from './pages/join/join.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { LessonViewComponent } from './pages/lesson-view/lesson-view.component';
import { LearningPathEditorComponent } from './pages/learning-path-editor/learning-path-editor.component';
import { AdminApprovalComponent } from './pages/admin-approval/admin-approval.component';
import { AdminCoursesComponent } from './pages/admin-courses/admin-courses.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'courses', component: CoursesComponent },
  { path: 'course/:id', component: CourseDetailComponent },
  { path: 'dashboard-student', component: DashboardStudentComponent, canActivate:[AuthGuard,RoleGuard], data:{roles:['student']} },
  { path: 'dashboard-admin', component: DashboardAdminComponent, canActivate:[AuthGuard,RoleGuard], data:{roles:['admin','superadmin']} },
  { path: 'dashboard-instructor', component: DashboardInstructorComponent, canActivate:[AuthGuard,RoleGuard], data:{roles:['instructor']} },
  { path: 'dashboard-observer', component: DashboardObserverComponent, canActivate:[AuthGuard,RoleGuard], data:{roles:['observer','admin','superadmin']} },
  { path: 'dashboard-em', component: DashboardEmComponent, canActivate:[AuthGuard,RoleGuard], data:{roles:['educationmanager']} },
  { path: 'admin-organizations', component: AdminOrganizationsComponent, canActivate:[AuthGuard,RoleGuard], data:{roles:['admin','superadmin']} },
  { path: 'admin-reports', component: AdminReportsComponent, canActivate:[AuthGuard,RoleGuard], data:{roles:['admin','superadmin']} },
  { path: 'invite', component: InviteComponent },
  { path: 'join/:code', component: JoinComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'lesson/:courseId/:nodeId', component: LessonViewComponent },
  { path: 'learning-path/:courseId', component: LearningPathEditorComponent },
  { path: 'admin-approval', component: AdminApprovalComponent, canActivate:[AuthGuard,RoleGuard], data:{roles:['admin','superadmin']} },
  { path: 'observer-analytics', component: ObserverAnalyticsComponent },
  { path: 'admin-users', component: AdminUsersComponent, canActivate:[AuthGuard,RoleGuard], data:{roles:['admin','superadmin']} },
  { path: 'admin-courses', component: AdminCoursesComponent, canActivate:[AuthGuard, RoleGuard], data:{ roles:['admin','superadmin'] } },

  { path: '**', redirectTo: '' }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
