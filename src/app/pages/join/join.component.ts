import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InviteService } from 'src/app/services/invite.service';
import { AuthService } from 'src/app/services/auth.service';
import { EnrollmentService } from 'src/app/services/enrollment.service';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styles:[`:host{display:block}`]
})
export class JoinComponent implements OnInit {
  code=''; result='';
  constructor(private route: ActivatedRoute, private inv: InviteService, private enr: EnrollmentService, private auth: AuthService, private router: Router){}
  ngOnInit(): void {
    this.code = this.route.snapshot.paramMap.get('code')||'';
    const u = this.auth.getCurrentUser(); if (!u){ this.result='Önce giriş yap'; return; }
    const res = this.inv.accept(this.code);
    if (!res){ this.result = 'Kod geçersiz'; return; }
    this.result = 'Davet kabul edildi';
    // not: InviteService.accept şu an sadece boolean dönüyor; courseId eşlemesini basitleştirelim (kod formatı taşıyorsa eklenebilir)
    setTimeout(()=> this.router.navigateByUrl('/courses'), 800);
  }
}
