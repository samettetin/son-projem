import { Injectable } from '@angular/core';

export interface AppTask {
  title: string;
  placeholder: string;
  validatorHint: string;
  type: 'code'|'mcq';
  pattern?: string;            // for 'code' type simple includes pattern
  options?: string[];          // for 'mcq'
  answerIndex?: number;        // for 'mcq'
}

@Injectable({ providedIn: 'root' })
export class AppTaskService {
  /** Always returns a task. Uses courseId/nodeId heuristics for flavor. */
  getTask(courseId: string, nodeId: string): AppTask {
    const id = (nodeId || '').toLowerCase();
    const course = (courseId || '').toLowerCase();

    // ---- JavaScript basics ----
    if (course.includes('js')){
      if (id.includes('variables') || id.includes('degisken')){
        return {
          title: 'Bir değişken tanımla ve konsola yazdır',
          placeholder: 'ör. const ad = "SEBA"; console.log(ad)',
          validatorHint: 'Kod "const" veya "let" ile tanımlama ve console.log içermeli.',
          type: 'code',
          pattern: 'console.log('
        };
      }
      if (id.includes('functions') || id.includes('fonksiyon')){
        return {
          title: 'Arrow function oluştur ve çağır',
          placeholder: 'ör. const topla=(a,b)=>a+b; console.log(topla(2,3))',
          validatorHint: 'Kod "=>" ve "console.log" içermeli.',
          type: 'code',
          pattern: '=>'
        };
      }
      return {
        title: 'console.log ile ekrana yaz',
        placeholder: 'ör. console.log("SEBA")',
        validatorHint: 'Kod "console.log(" içermeli.',
        type: 'code',
        pattern: 'console.log('
      };
    }

    // ---- React ----
    if (course.includes('react')){
      if (id.includes('state') || id.includes('use') || id.includes('hook')){
        return {
          title: 'useState hook’u ile sayaç kur',
          placeholder: 'ör. const [c,setC]=useState(0); // ... setC(c+1)',
          validatorHint: 'Cevap "useState" içermeli.',
          type: 'code',
          pattern: 'usestate'
        };
      }
      return {
        title: 'React bileşen yaşam döngüsü',
        placeholder: 'Aşağıdakilerden hangisi effect hook’un ikinci parametresini doğru açıklar?',
        validatorHint: 'Doğru seçeneği işaretleyin.',
        type: 'mcq',
        options: [
          'Bağımlılık dizisi (yeniden çalıştırma koşulları)',
          'Render sayısını döndürür',
          'Sadece CSS ekler',
          'Router’ı başlatır'
        ],
        answerIndex: 0
      };
    }

    // ---- Angular ----
    if (course.includes('angular')){
      if (id.includes('template') || id.includes('ngfor') || id.includes('pipe')){
        return {
          title: '*ngFor ile liste render et',
          placeholder: 'ör. <li *ngFor="let u of users">{{u.name}}</li>',
          validatorHint: 'Yanıtta "*ngFor" geçmeli.',
          type: 'code',
        pattern: '*ngfor'
        };
      }
      return {
        title: 'Angular temelleri',
        placeholder: 'Aşağıdaki yapılardan hangisi bileşen dekoratörüdür?',
        validatorHint: 'Doğru seçeneği işaretleyin.',
        type: 'mcq',
        options: ['@Component','@Injectable','@NgModule','Hepsi'],
        answerIndex: 3
      };
    }

    // ---- SQL/DB ----
    if (course.includes('sql') || course.includes('db')){
      return {
        title: 'Basit SELECT sorgusu yaz',
        placeholder: 'ör. SELECT * FROM courses;',
        validatorHint: 'Yanıt "select" ve "from" içermeli.',
        type: 'code',
        pattern: 'select*from'
      };
    }

    // ---- Python ----
    if (course.includes('py')){
      return {
        title: 'print ile ekrana yaz',
        placeholder: 'ör. print("SEBA")',
        validatorHint: 'Yanıt "print(" içermeli.',
        type: 'code',
        pattern: 'print('
      };
    }

    // ---- Default fallback (always available) ----
    return {
      title: 'Kısa bir örnek yaz',
      placeholder: 'ör. console.log("SEBA")',
      validatorHint: 'Kod alanına basit bir çıktı yazdırma komutu yazın.',
      type: 'code',
      pattern: 'console.log('
    };
  }

  validate(input: string, task: AppTask, mcqIndex?: number): boolean {
    if (task.type === 'code'){
      const v = (input||'').toLowerCase().replace(/\s+/g,'');
      const patt = (task.pattern||'').toLowerCase().replace(/\s+/g,'');
      return patt ? v.includes(patt) : v.length > 2;
    } else {
      return mcqIndex === task.answerIndex;
    }
  }
}
