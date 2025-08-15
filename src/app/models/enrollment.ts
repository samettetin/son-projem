export type ActivityType = 'lesson' | 'task' | 'quiz';

export interface ActivityProgress {
  id: string;
  type: ActivityType;
  title: string;
  completed: boolean;
  score?: number;
  timeSpent?: number;           // Dakika cinsinden
  startedAt?: string;           // Başlama zamanı
  completedAt?: string;         // Tamamlama zamanı
  attempts?: number;            // Deneme sayısı (quiz için)
  notes?: string;               // Öğrenci notları
  subActivities?: {             // Alt aktivite ilerlemesi
    id: string;
    completed: boolean;
    timeSpent?: number;
  }[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  startedAt: string;
  activities: ActivityProgress[];
  progress: number;
  timeSpentMinutes?: number;    // Toplam süre
  lastActivityAt?: string;      // Son aktivite zamanı
  estimatedCompletion?: string; // Tahmini tamamlama tarihi
  currentModule?: string;       // Şu anki modül
  currentActivity?: string;     // Şu anki aktivite
  totalPoints?: number;         // Toplam kazanılan puan
  certificateEarned?: boolean;  // Sertifika kazanıldı mı?
}
