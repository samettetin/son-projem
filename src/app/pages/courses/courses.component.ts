import { Component, OnInit } from '@angular/core';
import { CourseService } from 'src/app/services/course.service';
import { Course } from 'src/app/models/course';
import { SearchService, SavedView } from 'src/app/services/search.service';
import { AuthService } from 'src/app/services/auth.service';
import { UiService } from 'src/app/services/ui.service';
import { FavoritesService } from 'src/app/services/favorites.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {
  menuVisible = false;
  menuX = 0; menuY = 0;
  menuCourse?: Course;
  q = '';
  level: '' | 'beginner' | 'intermediate' | 'advanced' = '';
  list: Course[] = [];
  filtered: Course[] = [];
  views: SavedView[] = [];

  constructor(
    private cs: CourseService,
    private search: SearchService,
    private auth: AuthService,
    private ui: UiService,
    private fav: FavoritesService
  ){}

  ngOnInit(): void {
    const me = this.auth.getCurrentUser();
    this.list = this.cs.list();
    if (me?.orgId && (this.cs as any).listByOrg) {
      this.list = (this.cs as any).listByOrg(me.orgId);
    }
    this.apply();
    this.refreshViews();
  }

  apply(){
    const term = this.q.trim().toLowerCase();
    const lvl = this.level;
    this.filtered = this.list.filter(c => {
      const text = [c.title, c.description, (c.tags||[]).join(' ')].join(' ');
      const okTerm = !term || this.search.score(text, term) > 0;
      const okLevel = !lvl || c.level === lvl;
      return okTerm && okLevel;
    });
  }

  resetFilters(){ this.q=''; this.level=''; this.apply(); }

  saveView(){
    const title = prompt('Görünüm adı:', this.q ? `Arama: ${this.q}` : 'Görünüm');
    if (!title) return;
    this.search.save(title, this.q, this.level);
    this.refreshViews();
    this.ui.toast('Görünüm kaydedildi');
  }

  applyView(id:string){
    const v = this.views.find(x=>x.id===id); if(!v) return;
    this.q = v.query; this.level = v.level; this.apply();
  }
  removeView(id:string){ this.search.remove(id); this.refreshViews(); }
  private refreshViews(){ this.views = this.search.list(); }

  trackById(_:number, item:any){ return item?.id; }

  toggleFav(course: Course){
    this.fav.toggle(course.id);
    this.ui.toast('Favoriler güncellendi');
  }

  openContextMenu(ev: MouseEvent, course: Course){
    ev.preventDefault();
    this.menuCourse = course;
    this.menuX = ev.clientX; this.menuY = ev.clientY;
    this.menuVisible = true;
  }
  closeMenu(){ this.menuVisible = false; }
  ctxAddFav(){ if(this.menuCourse){ this.fav.add(this.menuCourse.id); this.menuVisible=false; this.apply(); } }
  ctxReset(){ this.ui.toast('İlerleme sıfırlandı'); this.menuVisible=false; }
  ctxAsk(){ this.ui.toast('Eğitmene soru gönderildi'); this.menuVisible=false; }

  saveCurrentFilter(name: string){
    const title = (name && name.trim()) ? name.trim() : (this.q ? `Arama: ${this.q}` : 'Görünüm');
    this.search.save(title, this.q, this.level);
    this.refreshViews();
    this.ui.toast('Görünüm kaydedildi');
  }
  loadFilter(name: string){
    const needle = (name||'').trim().toLowerCase();
    const list = this.search.list();
    const v = needle ? list.find(x=>x.title.toLowerCase()===needle) : list[0];
    if(!v){ this.ui.toast('Görünüm bulunamadı'); return; }
    this.q = v.query; this.level = v.level; this.apply();
  }

}
