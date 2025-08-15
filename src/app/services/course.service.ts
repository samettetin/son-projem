import { Injectable } from '@angular/core';
import { Course } from '../models/course';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class CourseService {
  getAll(){ return this.list(); }
  private readonly LS = 'courses';

  // --- storage helpers ---
  private read(): Course[] {
    return JSON.parse(localStorage.getItem(this.LS) || '[]');
  }
  private write(list: Course[]) {
    localStorage.setItem(this.LS, JSON.stringify(list));
  }

  /** İlk kurulumda örnek kursları ekler (eğer yoksa) */
  seedIfEmpty(): void {
    const data = this.read();
    if (data.length) return;

    const now = new Date().toISOString();
    const demo: Course[] = [
      {
        id: crypto.randomUUID(),
        title: 'JavaScript Temelleri',
        description: 'Değişkenler, fonksiyonlar, diziler ve DOM ile başlangıç.',
        level: 'beginner',
        estimatedHours: 8,
        tags: ['Teknik', 'Zorunlu'],
        instructorId: 'demo-instructor',
        createdAt: now,
        cover: 'assets/covers/js.png',
        modules: [
          {
            id: crypto.randomUUID(), name: 'Giriş', required: true, order: 1,
            activities: [
              { 
                id: crypto.randomUUID(), 
                type:'lesson', 
                title:'Değişkenler ve Tipler',
                durationMinutes: 45,
                required: true,
                points: 10,
                subActivities: [
                  { id: crypto.randomUUID(), type: 'lesson', title: 'String ve Number', durationMinutes: 20, required: true, points: 5 },
                  { id: crypto.randomUUID(), type: 'lesson', title: 'Boolean ve Array', durationMinutes: 25, required: true, points: 5 }
                ]
              },
              { 
                id: crypto.randomUUID(), 
                type:'task',   
                title:'Konsola 1–100 arası sayıları yaz',
                durationMinutes: 30,
                required: true,
                points: 15
              }
            ]
          },
          {
            id: crypto.randomUUID(), name: 'Orta Seviye', required: true, order: 2,
            activities: [
              { 
                id: crypto.randomUUID(), 
                type:'lesson', 
                title:'Diziler ve Objeler',
                durationMinutes: 60,
                required: true,
                points: 20,
                subActivities: [
                  { id: crypto.randomUUID(), type: 'lesson', title: 'Array Methods', durationMinutes: 30, required: true, points: 10 },
                  { id: crypto.randomUUID(), type: 'lesson', title: 'Object Destructuring', durationMinutes: 30, required: true, points: 10 }
                ]
              },
              { 
                id: crypto.randomUUID(), 
                type:'task',   
                title:'Bir diziyi ters çeviren fonksiyon yaz',
                durationMinutes: 45,
                required: true,
                points: 25
              }
            ]
          },
          {
            id: crypto.randomUUID(), name: 'Sınav', required: true, order: 3,
            minProgress: 80,
            passScore: 70,
            activities: [
              { 
                id: crypto.randomUUID(), 
                type:'quiz', 
                title:'JS Temelleri Mini Quiz',
                durationMinutes: 30,
                required: true,
                points: 30,
                questions: [
                  { question: 'JavaScript hangi türde bir dildir?', options: ['Compiled', 'Interpreted', 'Assembly', 'Machine'], answer: 1 },
                  { question: 'Hangi değişken tanımlama anahtar kelimesi block-scoped\'dur?', options: ['var', 'let', 'const', 'function'], answer: 1 },
                  { question: 'Array.push() metodu ne yapar?', options: ['İlk elemanı çıkarır', 'Son elemanı çıkarır', 'Sonuna eleman ekler', 'İlkine eleman ekler'], answer: 2 }
                ]
              }
            ]
          }
        ],
        popularity: 87,
        maxPoints: 100,
        difficulty: 3,
        certificateType: 'graded'
      },
      {
        id: crypto.randomUUID(),
        title: 'React ile Uygulama Geliştirme',
        description: 'Bileşenler, props/state, router ve temel mimari.',
        level: 'intermediate',
        estimatedHours: 10,
        tags: ['Teknik', 'Sertifikalı'],
        instructorId: 'demo-instructor',
        createdAt: now,
        cover: 'assets/covers/react.png',
        modules: [
          {
            id: crypto.randomUUID(), name: 'Giriş', required: true, order: 1,
            activities: [
              { 
                id: crypto.randomUUID(), 
                type:'lesson', 
                title:'Bileşen Mantığı',
                durationMinutes: 60,
                required: true,
                points: 25,
                subActivities: [
                  { id: crypto.randomUUID(), type: 'lesson', title: 'Functional Components', durationMinutes: 30, required: true, points: 15 },
                  { id: crypto.randomUUID(), type: 'lesson', title: 'JSX Syntax', durationMinutes: 30, required: true, points: 10 }
                ]
              },
              { 
                id: crypto.randomUUID(), 
                type:'task',   
                title:'Basit ToDo componenti yaz',
                durationMinutes: 90,
                required: true,
                points: 35
              }
            ]
          },
          {
            id: crypto.randomUUID(), name: 'İleri Seviye', required: true, order: 2,
            minProgress: 70,
            passScore: 75,
            activities: [
              { 
                id: crypto.randomUUID(), 
                type:'lesson', 
                title:'State Yönetimi',
                durationMinutes: 75,
                required: true,
                points: 30,
                subActivities: [
                  { id: crypto.randomUUID(), type: 'lesson', title: 'useState Hook', durationMinutes: 40, required: true, points: 15 },
                  { id: crypto.randomUUID(), type: 'lesson', title: 'useEffect Hook', durationMinutes: 35, required: true, points: 15 }
                ]
              },
              { 
                id: crypto.randomUUID(), 
                type:'quiz',   
                title:'React Temelleri Quiz',
                durationMinutes: 45,
                required: true,
                points: 40,
                questions: [
                  { question: 'React\'te state güncellemek için hangi hook kullanılır?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], answer: 0 },
                  { question: 'Props\'lar hangi yönde veri aktarır?', options: ['Child to Parent', 'Parent to Child', 'Bidirectional', 'Global'], answer: 1 },
                  { question: 'Component re-render\'ı ne tetikler?', options: ['Props değişimi', 'State değişimi', 'Her ikisi de', 'Hiçbiri'], answer: 2 }
                ]
              }
            ]
          }
        ],
        popularity: 92,
        maxPoints: 130,
        difficulty: 6,
        certificateType: 'graded',
        prerequisites: ['js-basics-course-id'] // JavaScript temelleri ön koşul
      }
    ];

    this.write(demo);
  }

  
  /** Varsayılan demo kurslarını ekle (deterministic id) */
  private seedDefaults(): Course[] {
    const now = new Date().toISOString();
    const js: Course = {
      id: 'js-basics',
      title: 'JavaScript Temelleri',
      description: 'Değişkenler, fonksiyonlar, diziler, DOM ve ES6 ile sağlam bir temel. Küçük görevler ve mini quizlerle ilerleme.',
      level: 'beginner',
      estimatedHours: 10,
      tags: ['Teknik', 'Zorunlu'],
      instructorId: 'demo-instructor',
      createdAt: now,
      cover: 'assets/covers/js.png',
      popularity: 90,
      maxPoints: 140,
      difficulty: 4,
      certificateType: 'completion',
      modules: [
        { id: 'm-intro', name: 'Giriş', required: true, order: 1, activities: [
          { id: 'js-lesson-variables', type:'lesson', title:'Değişkenler ve Tipler', durationMinutes: 40, required:true, points: 10 },
          { id: 'js-task-variables', type:'task', title:'Mini Görev: Profil Kartı', durationMinutes: 20, required:false, points: 10 },
          { id: 'js-quiz-intro', type:'quiz', title:'JS Giriş Quiz', durationMinutes: 10, required:true, points: 20,
            questions: [
              { question: 'const ile tanımlanan değişken güncellenebilir mi?', options:['Evet','Hayır','Sadece sayılarda'], answer: 1 },
              { question: 'Array.length ne döner?', options:['Son eleman','Eleman sayısı','Index'], answer: 1 }
            ]
          },
        ]},
        { id: 'm-mid', name: 'Orta Seviye', required: true, order: 2, activities: [
          { id: 'js-lesson-functions', type:'lesson', title:'Fonksiyonlar & Scope', durationMinutes: 45, required:true, points: 15 },
          { id: 'js-lesson-arrays', type:'lesson', title:'Diziler & Metotlar', durationMinutes: 45, required:true, points: 15 },
          { id: 'js-task-todo', type:'task', title:'Görev: Mini TODO App', durationMinutes: 40, required:true, points: 20 },
          { id: 'js-quiz-mid', type:'quiz', title:'Fonksiyonlar Quiz', durationMinutes: 12, required:true, points: 20,
            questions: [
              { question: 'Arrow function ile function declaration arasındaki fark?', options:['Hoist edilir','İkisi de aynıdır','Sadece isim farkı'], answer: 0 },
              { question: 'map() ne yapar?', options:['Filtreler','Döndürür ve dönüştürür','Siler'], answer: 1 }
            ]
          },
        ]},
        { id: 'm-adv', name: 'İleri Seviye', required: false, order: 3, activities: [
          { id: 'js-lesson-es6', type:'lesson', title:'ES6 Özellikleri', durationMinutes: 50, required:false, points: 15 },
          { id: 'js-task-fetch', type:'task', title:'Görev: Fetch API ile Veri Çek', durationMinutes: 30, required:false, points: 20 }
        ]},
        { id: 'm-exam', name: 'Sınav', required: true, order: 4, activities: [
          { id: 'js-exam', type:'quiz', title:'Final Sınavı', durationMinutes: 20, required:true, points: 30,
            questions: [
              { question:'const obj = {a:1}; obj.a=2 sonrası obj.a nedir?', options:['1','2','Hata'], answer: 1 },
              { question:'JSON.stringify ne yapar?', options:['Objeyi parse eder','Objeyi stringe çevirir','DOM yaratır'], answer: 1 }
            ]
          }
        ]}
      ]
    };

    const react: Course = {
      id: 'react-app',
      title: 'React ile Uygulama Geliştirme',
      description: `Component, props, state ve hook'larla SPA geliştirme. Küçük görevler ve quizlerle pratik.`,
      level: 'intermediate',
      estimatedHours: 12,
      tags: ['Teknik', 'Sertifikalı'],
      instructorId: 'demo-instructor',
      createdAt: now,
      cover: 'assets/covers/react.png',
      popularity: 95,
      maxPoints: 160,
      difficulty: 6,
      certificateType: 'graded',
      prerequisites: ['js-basics'],
      modules: [
        { id:'r-intro', name:'Giriş', required:true, order:1, activities:[
          { id:'r-lesson-react', type:'lesson', title:'React Nedir?', durationMinutes:30, required:true, points:10 },
          { id:'r-lesson-jsx', type:'lesson', title:'JSX & Props', durationMinutes:40, required:true, points:15 },
          { id:'r-quiz-intro', type:'quiz', title:'React Giriş Quiz', durationMinutes:10, required:true, points:20,
            questions:[
              { question:'React hangi yaklaşım?', options:['MVC server','Bileşen tabanlı UI','Sadece CSS'], answer:1 },
              { question:'JSX içinde class yerine?', options:['className','css','class'], answer:0 }
            ]
          }
        ]},
        { id:'r-mid', name:'Orta Seviye', required:true, order:2, activities:[
          { id:'r-lesson-state', type:'lesson', title:'useState & useEffect', durationMinutes:50, required:true, points:20 },
          { id:'r-task-counter', type:'task', title:'Görev: Sayaç + Timer', durationMinutes:30, required:true, points:20 },
          { id:'r-quiz-hooks', type:'quiz', title:'Hooklar Quiz', durationMinutes:12, required:true, points:25,
            questions:[
              { question:'Yan etkiler için hangi hook?', options:['useState','useEffect','useMemo'], answer:1 },
              { question:'State set fonksiyonu?', options:['setCount','updateState','setStateVar'], answer:0 }
            ]
          }
        ]},
        { id:'r-adv', name:'İleri', required:false, order:3, activities:[
          { id:'r-lesson-router', type:'lesson', title:'Routing & Context', durationMinutes:45, required:false, points:15 },
          { id:'r-task-api', type:'task', title:'Görev: API Listeleme', durationMinutes:45, required:false, points:20 }
        ]},
        { id:'r-exam', name:'Sınav', required:true, order:4, activities:[
          { id:'r-exam', type:'quiz', title:'React Final Sınavı', durationMinutes:20, required:true, points:35,
            questions:[
              { question:'Props değiştiğinde component?', options:['Yeniden render olabilir','Asla render olmaz','DOM silinir'], answer:0 },
              { question:'State nerede tutulur?', options:['Global window','Component içinde','CSS'], answer:1 }
            ]
          }
        ]}
      ]
    };

    return [js, react];
  }

  /** Eğer kayıt yoksa ya da demo kurslar eksikse ekle */
  private ensureSeed(): void {
    const existing = this.read();
    const needInit = !existing || !existing.length;
    const requiredIds = new Set(['js-basics','react-app']);
    const hasAll = existing && requiredIds.size === new Set(existing.map(c=>c.id).filter(id=>requiredIds.has(id))).size;
    if (needInit || !hasAll) {
      const merged = [...(existing||[])];
      const defaults = this.seedDefaults();
      for (const d of defaults) {
        if (!merged.find(c=>c.id===d.id)) merged.push(d);
      }
      this.write(merged);
    }
  }
/** Popülerliğe göre sıralı liste */
  list(): Course[] { this.ensureSeed();
    return this.read().sort((a, b) => b.popularity - a.popularity);
  }

  /** Organizasyona göre filtreli liste (orgId verilmezse org atanmamışlar dahil hepsi) */
  listForOrg(orgId?: string): Course[] {
    const all = this.list();
    if (!orgId) return all.filter(c => !c.orgId);
    return all.filter(c => c.orgId === orgId);
  }

  /** Tekil kurs */
  get(id: string): Course | undefined {
    return this.read().find(c => c.id === id);
  }

  /** Kurs oluştur */
  create(course: Omit<Course, 'id' | 'createdAt' | 'popularity'>): Course {
    const list = this.read();
    const item: Course = {
      ...course,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      popularity: Math.floor(60 + Math.random() * 40)
    };
    list.push(item);
    this.write(list);
    return item;
  }

  /** Kapak görseli yoksa default atamak istersen kullanabilirsin */
  ensureCover(c: Course): string {
    return c.cover || 'assets/covers/default.png';
  }

  /** Gelişmiş arama - relevans skoruna göre sıralı */
  search(query: string, filters?: {
    level?: string;
    tags?: string[];
    orgId?: string;
    difficulty?: number;
    maxDuration?: number;
  }): { course: Course; score: number }[] {
    const courses = this.list();
    const results: { course: Course; score: number }[] = [];

    courses.forEach(course => {
      let score = 0;
      const searchText = `${course.title} ${course.description} ${course.tags.join(' ')} ${course.instructorNotes || ''}`.toLowerCase();
      const queryLower = query.toLowerCase();

      // Başlık eşleşmesi (en yüksek puan)
      if (course.title.toLowerCase().includes(queryLower)) score += 100;
      
      // Açıklama eşleşmesi
      if (course.description.toLowerCase().includes(queryLower)) score += 50;
      
      // Etiket eşleşmesi
      course.tags.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) score += 30;
      });

      // Eğitmen notları eşleşmesi
      if (course.instructorNotes?.toLowerCase().includes(queryLower)) score += 25;

      // Filtreler
      if (filters?.level && course.level !== filters.level) score = 0;
      if (filters?.tags && !filters.tags.some(tag => course.tags.includes(tag))) score = 0;
      if (filters?.orgId && course.orgId !== filters.orgId) score = 0;
      if (filters?.difficulty && course.difficulty && course.difficulty > filters.difficulty) score = 0;
      if (filters?.maxDuration && course.estimatedHours > filters.maxDuration) score = 0;

      if (score > 0) {
        results.push({ course, score });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }

  /** Akıllı öneriler - kullanıcının seviyesine ve ilgi alanlarına göre */
  getRecommendations(user: User, limit: number = 5): Course[] {
    const courses = this.list();
    const recommendations: { course: Course; score: number }[] = [];

    courses.forEach(course => {
      let score = 0;

      // Seviye uyumu
      if (user.level) {
        const levelDiff = Math.abs(this.getLevelNumber(course.level) - user.level);
        score += Math.max(0, 50 - levelDiff * 10);
      }

      // Departman uyumu
      if (user.department && course.tags.some(tag => tag.toLowerCase().includes(user.department!.toLowerCase()))) {
        score += 30;
      }

      // Organizasyon uyumu
      if (user.orgId && course.orgId === user.orgId) {
        score += 40;
      }

      // Popülerlik bonusu
      score += course.popularity * 0.1;

      if (score > 0) {
        recommendations.push({ course, score });
      }
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.course);
  }

  /** Kurs ön koşullarını kontrol et */
  checkPrerequisites(courseId: string, completedCourseIds: string[]): { canEnroll: boolean; missing: string[] } {
    const course = this.get(courseId);
    if (!course || !course.prerequisites || course.prerequisites.length === 0) {
      return { canEnroll: true, missing: [] };
    }

    const missing = course.prerequisites.filter(prereqId => !completedCourseIds.includes(prereqId));
    return {
      canEnroll: missing.length === 0,
      missing
    };
  }

  /** Seviye numarasına çevir */
  private getLevelNumber(level: string): number {
    switch (level) {
      case 'beginner': return 1;
      case 'intermediate': return 3;
      case 'advanced': return 5;
      default: return 1;
    }
  }
  listByOrg(orgId: string){ return this.list().filter((c:any)=> c.orgId===orgId); }
}
