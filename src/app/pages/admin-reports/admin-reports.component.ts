
import { Component, OnInit } from '@angular/core';
import { LiveService } from 'src/app/services/live.service';

@Component({
  selector: 'app-admin-reports',
  templateUrl: './admin-reports.component.html',
  styles:[`:host{display:block}`]
})
export class AdminReportsComponent implements OnInit {
  active = 0; feed:any[]=[];
  constructor(private live: LiveService){}
  ngOnInit(): void { this.refresh(); }
  refresh(){ this.active = this.live.getActiveCount(); this.feed = this.live.getFeed(); }
}
