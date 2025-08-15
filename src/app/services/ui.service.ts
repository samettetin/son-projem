import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  confirm(title: string, text?: string, confirmText: string = 'Onayla', cancelText: string = 'Vazgeç', icon: SweetAlertIcon = 'question') {
    return Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#ef4444'
    });
  }

  alert(title: string, icon: SweetAlertIcon = 'info') {
    return Swal.fire(title, '', icon);
  }

  toast(message: string, icon: SweetAlertIcon = 'success') {
    return Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title: message,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
  }
}
