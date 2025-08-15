
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LearningPathService, Lp } from 'src/app/services/learning-path.service';

@Component({
  selector: 'app-learning-path-editor',
  templateUrl: './learning-path-editor.component.html',
  styles:[`:host{display:block}`]
})
export class LearningPathEditorComponent implements OnInit {
  courseId = '';
  lp!: Lp;
  newModuleTitle = '';

  constructor(private route: ActivatedRoute, private lpSvc: LearningPathService){}
  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('courseId') || '';
    this.lp = this.lpSvc.get(this.courseId);
  }
  addModule(){
    const id = 'm-'+Math.random().toString(36).slice(2,6);
    this.lp.modules.push({ id, title: this.newModuleTitle||'Yeni Modül', required:false });
    this.newModuleTitle=''; this.save();
    alert('Müfredat güncellendi');
  }
  moveUp(i:number){ if(i<=0) return; const a=this.lp.modules; [a[i-1],a[i]]=[a[i],a[i-1]]; this.save(); alert('Müfredat güncellendi'); }
  moveDown(i:number){ const a=this.lp.modules; if(i>=a.length-1) return; [a[i+1],a[i]]=[a[i],a[i+1]]; this.save(); alert('Müfredat güncellendi'); }
  save(){ this.lpSvc.save(this.lp); }
}
