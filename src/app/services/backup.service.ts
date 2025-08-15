
import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class BackupService {
  snapshot(){
    const dump: any = {};
    for (let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i)!;
      dump[k] = localStorage.getItem(k);
    }
    const blob = new Blob([JSON.stringify(dump,null,2)], { type:'application/json' });
    return blob;
  }
  restore(json: string){
    const data = JSON.parse(json);
    for (const k of Object.keys(data)){
      localStorage.setItem(k, data[k]);
    }
  }
}
