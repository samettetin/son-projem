// src/app/utils/role-label.ts

// Uygulamada kullandığımız rol tipleri (User.role ile uyumlu olmalı)
export type Role = 'student' | 'instructor' | 'educationmanager' | 'observer' | 'admin';

// İngilizce rol anahtarlarını Türkçe etiketlere çevirme
export function getRoleLabel(role: Role | string): string {
  switch (role) {
    case 'student':           return 'Öğrenci';
    case 'instructor':        return 'Eğitmen';
    case 'educationmanager':  return 'Eğitim Yöneticisi';
    case 'observer':          return 'Gözlemci';
    case 'admin':             return 'Yönetici';
    default:                  return String(role);
  }
}

// (Opsiyonel) Kayıt formu için seçenek listesi
export function getRoleOptions(): Array<{ value: Role; label: string }> {
  return [
    { value: 'student',          label: 'Öğrenci' },
    { value: 'instructor',       label: 'Eğitmen' },
    { value: 'educationmanager', label: 'Eğitim Yöneticisi' },
    { value: 'observer',         label: 'Gözlemci' },
    { value: 'admin',            label: 'Yönetici' }
  ];
}
