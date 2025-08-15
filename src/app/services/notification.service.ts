import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  createdAt: string; // ISO
  read?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly LS = 'notifications';

  private readAll(): NotificationItem[] {
    return JSON.parse(localStorage.getItem(this.LS) || '[]');
  }
  private writeAll(list: NotificationItem[]): void {
    localStorage.setItem(this.LS, JSON.stringify(list));
  }

  list(max?: number): NotificationItem[] {
    const list = this.readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return typeof max === 'number' ? list.slice(0, max) : list;
  }

  push(type: NotificationItem['type'], message: string): NotificationItem {
    const all = this.readAll();
    const item: NotificationItem = {
      id: crypto.randomUUID(),
      type,
      message,
      createdAt: new Date().toISOString(),
      read: false
    };
    all.push(item);
    this.writeAll(all);
    return item;
  }

  markRead(id: string): void {
    const all = this.readAll();
    const i = all.findIndex(n => n.id === id);
    if (i > -1) {
      all[i].read = true;
      this.writeAll(all);
    }
  }

  clear(): void { this.writeAll([]); }

  /** Simulates a real-time notification to the user */
  notify(message: string, icon: SweetAlertIcon = 'info', title?: string): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title: title || message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  }

  /** Simulates a global activity feed update */
  logActivity(activity: string): void {
    // In a real app, this would push to a global feed.
    // For simulation, we can log to console or a dedicated "activity stream" component.
    console.log(`[ACTIVITY FEED] ${activity}`);
    // Optionally, trigger a small toast for "new activity"
    // this.notify(activity, 'info', 'Yeni Aktivite');
  }
}


