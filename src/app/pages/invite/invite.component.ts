
import { Component } from '@angular/core';
import { InviteService } from 'src/app/services/invite.service';
import { CourseService } from 'src/app/services/course.service';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styles:[`:host{display:block}`]
})
export class InviteComponent {
  email=''; courseId=''; code='';
  courses:any[]=[];
  constructor(private inv: InviteService, private coursesSvc: CourseService){
    this.courses = this.coursesSvc.list();
  }
  create(){ const inv = this.inv.createInvite(this.email, this.courseId); this.code = inv.code; alert('Davet kodu: '+this.code); }
}
