// src/app/models/course.ts
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CertificateType = 'none' | 'completion' | 'graded' | 'qr';

export interface CourseActivity {
  id: string;
  type: 'lesson' | 'task' | 'quiz';
  title: string;
  mediaUrl?: string;            // Video, PDF, doküman URL'i
  durationMinutes?: number;     // Tahmini süre
  subActivities?: CourseActivity[]; // Alt konular (3-4 seviyeye kadar)
  questions?: { question: string; options: string[]; answer: number }[]; // Quiz soruları
  required?: boolean;           // Zorunlu aktivite mi?
  points?: number;              // Aktivite puanı
}

export interface CourseModule {
  id: string;
  name: string;                 // Giriş / Orta / İleri / Sınav vb.
  required: boolean;
  activities?: CourseActivity[]; // modül içeriği
  minProgress?: number;         // bu modül için minimum %
  passScore?: number;           // bu modülün quizleri için geçiş notu
  order?: number;               // sıralama için
}

export interface Course {
  assignedUserIds?: string[];   // bu kursa atanmış kullanıcılar
  id: string;
  title: string;
  description: string;
  level: CourseLevel;
  estimatedHours: number;       // tahmini süre
  tags: string[];               // Teknik, Soft Skills...
  instructorId: string;         // User.id
  createdAt: string;
  cover?: string;
  modules: CourseModule[];      // müfredat
  popularity: number;           // simülatif metrik: görünürlük/sıralama
  orgId?: string;               // organizasyon alanı
  prerequisites?: string[];     // önce tamamlanması gereken kurs id'leri
  certificateType?: CertificateType;
  instructorNotes?: string;
  maxPoints?: number;           // kurs toplam puanı
  difficulty?: number;          // zorluk skoru 1-10
  published?: boolean;          // <— eklendi: yayın durumu
}
