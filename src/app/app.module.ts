import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

// Core
import { NavbarComponent } from './core/navbar/navbar.component';
import { FooterComponent } from './core/footer/footer.component';
import { SidebarComponent } from './core/sidebar/sidebar.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { AdminCoursesComponent } from './pages/admin-courses/admin-courses.component';
// Pages
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { CourseDetailComponent } from './pages/course-detail/course-detail.component';
import { LessonViewComponent } from './pages/lesson-view/lesson-view.component';
import { LearningPathEditorComponent } from './pages/learning-path-editor/learning-path-editor.component';
import { InviteComponent } from './pages/invite/invite.component';
import { JoinComponent } from './pages/join/join.component';
import { SettingsComponent } from './pages/settings/settings.component';

// Dashboards / Admin
import { DashboardAdminComponent } from './pages/dashboard-admin/dashboard-admin.component';
import { DashboardEmComponent } from './pages/dashboard-em/dashboard-em.component';
import { DashboardInstructorComponent } from './pages/dashboard-instructor/dashboard-instructor.component';
import { DashboardObserverComponent } from './pages/dashboard-observer/dashboard-observer.component';
import { DashboardStudentComponent } from './pages/dashboard-student/dashboard-student.component';
import { AdminApprovalComponent } from './pages/admin-approval/admin-approval.component';
import { AdminOrganizationsComponent } from './pages/admin-organizations/admin-organizations.component';
import { AdminReportsComponent } from './pages/admin-reports/admin-reports.component';
import { ObserverAnalyticsComponent } from './pages/observer-analytics/observer-analytics.component';

@NgModule({
  declarations: [
    AppComponent,
    // core
    NavbarComponent, FooterComponent, SidebarComponent,
    // pages
    HomeComponent, LoginComponent, RegisterComponent,
    CoursesComponent, CourseDetailComponent, LessonViewComponent,
    LearningPathEditorComponent, InviteComponent, JoinComponent, SettingsComponent,
    // dashboards
    DashboardAdminComponent, DashboardEmComponent, DashboardInstructorComponent,
    DashboardObserverComponent, DashboardStudentComponent,
    // admin
    AdminApprovalComponent, AdminOrganizationsComponent, AdminReportsComponent,
    // observer
    AdminUsersComponent,
    AdminCoursesComponent,
    ObserverAnalyticsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DragDropModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
