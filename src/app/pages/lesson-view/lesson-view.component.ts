import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentNode, ContentService } from 'src/app/services/content.service';
import { AuthService } from 'src/app/services/auth.service';
import { AppTaskService, AppTask } from 'src/app/services/app-task.service';

@Component({
  selector: 'app-lesson-view',
  templateUrl: './lesson-view.component.html',
  styleUrls: ['./lesson-view.component.scss']
})
export class LessonViewComponent implements OnInit, OnDestroy {

  courseId!: string;
  nodeId!: string;

  tree: ContentNode[] = [];
  node: ContentNode | null = null;

  // user
  me = this.auth.getCurrentUser();

  // quiz state
  quizAnswer: number | null = null;
  quizPassed = false;

  // interactive application task
  taskConfig!: AppTask;
  taskAnswer: string = '';
  mcqChoice: number | null = null;

  // completion gate
  checkedRead: boolean = false;
  canComplete: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private content: ContentService,
    private auth: AuthService,
    private appTask: AppTaskService
  ){}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('courseId') || this.route.snapshot.queryParamMap.get('courseId') || '';
    this.nodeId   = this.route.snapshot.paramMap.get('nodeId')   || this.route.snapshot.queryParamMap.get('nodeId')   || '';

    // load content
    this.tree = this.content.getTree(this.courseId) || [];
    this.node = this.findNode(this.nodeId, this.tree);

    // load application task configuration
    try { this.taskConfig = this.appTask.getTask(this.courseId, this.nodeId); } catch {}

    // initial completeness calculation
    this.syncCanComplete();
  }

  ngOnDestroy(): void {}

  // --- helpers ---
  private findNode(id: string, nodes: ContentNode[]): ContentNode | null {
    for (const n of nodes || []) {
      if (n.id === id) return n;
      const children = n.children || [];
      const hit = this.findNode(id, children);
      if (hit) return hit;
    }
    return null;
  }

  // --- quiz actions ---
  choose(i: number){ this.quizAnswer = i; }

  submitQuiz(){
    if (!this.me || !this.node) return;
    if (this.node.quiz && this.node.quiz.length){
      const correctIndex = this.node.quiz[0].answer;
      this.quizPassed = this.quizAnswer === correctIndex;
      this.content.recordQuiz(this.me.id, this.courseId, this.node.id, this.quizPassed);
      this.syncCanComplete();
    }
  }

  // --- application task validation ---
  validateTask(){
    try {
      this.canComplete = this.appTask.validate(this.taskAnswer, this.taskConfig, this.mcqChoice ?? undefined) && this.checkedRead;
    } catch {
      this.canComplete = this.checkedRead; // fallback
    }
  }

  // recompute based on both quiz and task
  private syncCanComplete(){
    const taskOk = (() => {
      try { return this.appTask.validate(this.taskAnswer, this.taskConfig, this.mcqChoice ?? undefined); }
      catch { return true; } // if task not configured, don't block
    })();
    this.canComplete = !!(this.checkedRead && (taskOk || this.quizPassed));
  }

  // called by checkbox change from template (two-way bound as [(ngModel)]="checkedRead")
  onAcknowledgeChange(){ this.syncCanComplete(); }

  // --- completion ---
  markDone(){
    if(!this.canComplete || !this.me || !this.node) return;
    this.content.markComplete(this.me.id, this.courseId, this.node.id);
  }

  // alias for template compatibility
  complete(){ this.markDone(); }
}
