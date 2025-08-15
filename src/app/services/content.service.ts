import { Injectable } from '@angular/core';

export interface ContentNode {
  id: string;
  title: string;
  body?: string;
  children?: ContentNode[];
  media?: { name:string, mime:string, data:string }[];
  quiz?: { q:string; options:string[]; answer:number }[];
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  private key(courseId: string){ return 'content-' + courseId; }
  private prKey(userId: string, courseId: string){ return `progress-${userId}-${courseId}`; }

  /** Kurs ağacını getir (yoksa seed oluşturur) */
  getTree(courseId: string): ContentNode[] {
    this.ensureSeed(courseId);
    try{
      return JSON.parse(localStorage.getItem(this.key(courseId)) || '[]');
    }catch{ return []; }
  }

  /** İlerleme objesi: nodeId -> { done:boolean, score:number|null, last:number } */
  getProgress(userId: string, courseId: string): Record<string, {done:boolean; score:number|null; last:number}> {
    try{ return JSON.parse(localStorage.getItem(this.prKey(userId, courseId)) || '{}'); } catch { return {}; }
  }

  private setProgress(userId: string, courseId: string, data: any){
    localStorage.setItem(this.prKey(userId, courseId), JSON.stringify(data));
  }

  markComplete(userId:string, courseId:string, nodeId:string){
    const pr = this.getProgress(userId, courseId);
    pr[nodeId] = { ...(pr[nodeId]||{score:null,last:Date.now()}), done:true, last: Date.now() };
    this.setProgress(userId, courseId, pr);
  }

  recordQuiz(userId:string, courseId:string, nodeId:string, correct:boolean){
    const pr = this.getProgress(userId, courseId);
    const prev = pr[nodeId] || { done:false, score:null, last: Date.now() };
    const score = correct ? 100 : 0;
    pr[nodeId] = { ...prev, score, last: Date.now() };
    this.setProgress(userId, courseId, pr);
  }

  /** Demo içerik */
  ensureSeed(courseId: string){
    const existing = localStorage.getItem(this.key(courseId));
    if (existing) return;

    let tree: ContentNode[] = [];

    if (courseId==='js-basics'){
      tree = [
        { id:'js-intro', title:'Giriş: Neden JavaScript?',
          body:`JS; web'in programlama dilidir. Bu derste JS'in tarayıcıdaki rolünü,
DOM ile etkileşimi ve temel çalışma modelini öğrenirsin.`,
          quiz:[{ q:'JavaScript en çok nerede çalışır?', options:['Tarayıcı','Veritabanı','Photoshop Filtresi','BI Aracı'], answer:0 }]
        },
        { id:'js-variables', title:'Değişkenler & Türler',
          body:`let/const, primitifler (string, number, boolean, null, undefined, symbol, bigint) ve referans türleri.
İpucu: const = yeniden atama yok; let = blok kapsamı.`,
          quiz:[{ q:'Aşağıdakilerden hangisi blok kapsamı sağlar?', options:['var','let','function','window'], answer:1 }]
        },
        { id:'js-functions', title:'Fonksiyonlar',
          body:`Fonksiyon ifadeleri, arrow function, this bağlamı ve parametre varsayılanları.`,
          quiz:[{ q:'Arrow function hangi özelliğiyle bilinir?', options:['this’i bağlamaz','Hoist edilir','Sadece async olur','Yok'], answer:0 }]
        },
        { id:'js-dom', title:'DOM Manipülasyonu',
          body:`querySelector, event dinleme, classList, dataset ve render döngüsü.`,
          quiz:[{ q:'Bir elementi seçmek için hangisi kullanılır?', options:['fs.readFile','querySelector','console.table','JSON.parse'], answer:1 }]
        },
        { id:'js-final', title:'Mini Sınav',
          body:'Bu bölüm genel tekrar içerir.',
          quiz:[
            { q:'const ile let arasındaki fark?', options:['hiçbiri','const yeniden atanamaz','let globaldir','let function scope’tur'], answer:1 },
            { q:'DOM nedir?', options:['Sunucu','HTML’in ağaç gösterimi','Veritabanı','Framework'], answer:1 }
          ]
        }
      ];
    }

    if (courseId==='react-app'){
      tree = [
        { id:'react-intro', title:'React’e Giriş',
          body:`Bileşen mantığı, JSX, tek yönlü veri akışı.`,
          quiz:[{ q:'JSX neyin kısaltmasıdır?', options:['Java eXtender','JavaScript XML','JSON X','JIT Syntax'], answer:1 }]
        },
        { id:'react-state', title:'State & Props',
          body:`useState, props ile alt bileşenlere veri akışı, controlled input.`,
          quiz:[{ q:'State’i değiştirmek için?', options:['this.state=','setState/useState','window.state','eval'], answer:1 }]
        },
        { id:'react-effects', title:'useEffect & Lifecycle',
          body:`Yan etkiler, bağımlılık dizisi, cleanup fonksiyonu.`,
          quiz:[{ q:'useEffect ikinci parametre?', options:['bağımlılık dizisi','render sayısı','DOM','stil'], answer:0 }]
        },
        { id:'react-router', title:'Routing & SPA',
          body:`Router mantığı, Link, dinamik rotalar.`,
          quiz:[{ q:'SPA nedir?', options:['Tek sayfa uygulaması','Sunucu tarafı PDF','CSS kütüphanesi','CLI'], answer:0 }]
        },
        { id:'react-final', title:'Final Görevi',
          body:`Todo uygulaması: ekle/sil/tamamla + localStorage kaydı. İpuçları ve checklist sunulur.`
        }
      ];
    }

    localStorage.setItem(this.key(courseId), JSON.stringify(tree));
  }
}
