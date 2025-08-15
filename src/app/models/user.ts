export type Role = 'superadmin'|'educationmanager'|'instructor'|'student'|'observer'|'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  username?: string;
  password: string;
  role: Role;
  approved: boolean;
  rejected?: boolean;
  orgId?: string;
  department?: string;
  // Gamification ve ilerleme takibi
  level?: number;                    // Kullanıcı seviyesi
  experience?: number;               // Toplam deneyim puanı
  badges?: string[];                 // Kazanılan rozetler
  totalStudyTime?: number;           // Toplam çalışma süresi (dakika)
  coursesCompleted?: number;         // Tamamlanan kurs sayısı
  averageScore?: number;             // Ortalama quiz puanı
  lastActive?: string;               // Son aktif olma zamanı
  preferences?: {                    // Kullanıcı tercihleri
    theme?: 'light' | 'dark' | 'focus';
    fontSize?: 'small' | 'medium' | 'large';
    notifications?: boolean;
    shortcuts?: boolean;
  };
}
