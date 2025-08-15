import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Course } from '../models/course';
import { NotificationService } from './notification.service';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'achievement' | 'milestone' | 'special';
  requirement: string;
  points: number;
}

export interface Achievement {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  courseId?: string;
  score?: number;
}

@Injectable({ providedIn: 'root' })
export class GamificationService {
  private readonly LS_BADGES = 'badges';
  private readonly LS_ACHIEVEMENTS = 'achievements';
  private readonly LS_LEVELS = 'userLevels';

  private readonly BADGES: Badge[] = [
    {
      id: 'first-course',
      name: 'İlk Adım',
      description: 'İlk kursunu tamamladın!',
      icon: '🎯',
      category: 'milestone',
      requirement: '1 kurs tamamla',
      points: 100
    },
    {
      id: 'quiz-master',
      name: 'Quiz Ustası',
      description: 'Quiz\'de %90+ puan aldın!',
      icon: '🧠',
      category: 'achievement',
      requirement: 'Quiz\'de yüksek puan al',
      points: 150
    },
    {
      id: 'speed-learner',
      name: 'Hızlı Öğrenen',
      description: 'Kursu tahmin edilen süreden önce bitirdin!',
      icon: '⚡',
      category: 'achievement',
      requirement: 'Hızlı kurs tamamlama',
      points: 200
    },
    {
      id: 'streak-master',
      name: 'Seri Öğrenen',
      description: '7 gün üst üste aktif oldun!',
      icon: '🔥',
      category: 'milestone',
      requirement: '7 gün üst üste aktif ol',
      points: 300
    },
    {
      id: 'perfect-score',
      name: 'Mükemmeliyetçi',
      description: 'Bir kursu %100 puanla tamamladın!',
      icon: '🏆',
      category: 'achievement',
      requirement: 'Mükemmel puan',
      points: 500
    },
    {
      id: 'course-creator',
      name: 'Eğitmen',
      description: 'İlk kursunu oluşturdun!',
      icon: '👨‍🏫',
      category: 'special',
      requirement: 'Kurs oluştur',
      points: 400
    },
    {
      id: 'social-learner',
      name: 'Sosyal Öğrenen',
      description: '5 farklı kursa katıldın!',
      icon: '🤝',
      category: 'milestone',
      requirement: '5 farklı kurs',
      points: 250
    },
    {
      id: 'night-owl',
      name: 'Gece Kuşu',
      description: 'Gece saatlerinde öğrenmeye devam ettin!',
      icon: '🦉',
      category: 'special',
      requirement: 'Gece öğrenme',
      points: 100
    }
  ];

  constructor(private notification: NotificationService) {
    this.initializeBadges();
  }

  private initializeBadges(): void {
    if (!localStorage.getItem(this.LS_BADGES)) {
      localStorage.setItem(this.LS_BADGES, JSON.stringify(this.BADGES));
    }
  }

  /** Kullanıcıya rozet ver */
  awardBadge(userId: string, badgeId: string, courseId?: string, score?: number): Achievement | null {
    const badge = this.BADGES.find(b => b.id === badgeId);
    if (!badge) return null;

    const achievement: Achievement = {
      id: crypto.randomUUID(),
      userId,
      badgeId,
      earnedAt: new Date().toISOString(),
      courseId,
      score
    };

    const achievements = this.getUserAchievements(userId);
    achievements.push(achievement);
    this.saveUserAchievements(userId, achievements);

    // Kullanıcıya bildirim gönder
    this.notification.notify(`🎉 Yeni rozet kazandın: ${badge.name}!`, 'success', 'Rozet Kazanıldı!');

    return achievement;
  }

  /** Kullanıcının rozetlerini getir */
  getUserBadges(userId: string): Badge[] {
    const achievements = this.getUserAchievements(userId);
    return achievements.map(a => this.BADGES.find(b => b.id === a.badgeId)!);
  }

  /** Kullanıcının başarılarını getir */
  getUserAchievements(userId: string): Achievement[] {
    const data = localStorage.getItem(`${this.LS_ACHIEVEMENTS}_${userId}`);
    return data ? JSON.parse(data) : [];
  }

  private saveUserAchievements(userId: string, achievements: Achievement[]): void {
    localStorage.setItem(`${this.LS_ACHIEVEMENTS}_${userId}`, JSON.stringify(achievements));
  }

  /** Kullanıcı seviyesini hesapla ve güncelle */
  updateUserLevel(user: User, courseCompleted?: Course, score?: number): { newLevel: number; levelUp: boolean } {
    const currentLevel = user.level || 1;
    const currentExp = user.experience || 0;
    
    let expGained = 0;
    let levelUp = false;

    // Kurs tamamlama bonusu
    if (courseCompleted) {
      expGained += 100; // Temel kurs tamamlama puanı
      
      // Hızlı tamamlama bonusu
      if (courseCompleted.estimatedHours > 0) {
        // Simüle edilmiş süre takibi - gerçekte enrollment'dan alınacak
        const actualTime = courseCompleted.estimatedHours * 0.8; // %20 hızlı
        if (actualTime < courseCompleted.estimatedHours) {
          expGained += 50;
        }
      }
    }

    // Quiz puanı bonusu
    if (score && score >= 90) {
      expGained += 75; // Yüksek puan bonusu
    } else if (score && score >= 70) {
      expGained += 25; // Geçer puan bonusu
    }

    const newExp = currentExp + expGained;
    const newLevel = Math.floor(newExp / 100) + 1; // Her 100 XP'de seviye atlama

    if (newLevel > currentLevel) {
      levelUp = true;
      this.notification.notify(`🎊 Seviye ${newLevel}'e yükseldin!`, 'success', 'Seviye Atladın!');
    }

    // Kullanıcıyı güncelle
    user.level = newLevel;
    user.experience = newExp;
    user.lastActive = new Date().toISOString();

    return { newLevel, levelUp };
  }

  /** Otomatik rozet kontrolü */
  checkForBadges(user: User, action: 'course_completed' | 'quiz_completed' | 'course_created' | 'daily_login', data?: any): void {
    const achievements = this.getUserAchievements(user.id);
    const earnedBadgeIds = achievements.map(a => a.badgeId);

    // İlk kurs tamamlama
    if (action === 'course_completed' && !earnedBadgeIds.includes('first-course')) {
      this.awardBadge(user.id, 'first-course', data?.courseId);
    }

    // Quiz ustası
    if (action === 'quiz_completed' && data?.score >= 90 && !earnedBadgeIds.includes('quiz-master')) {
      this.awardBadge(user.id, 'quiz-master', data?.courseId, data?.score);
    }

    // Mükemmel puan
    if (action === 'course_completed' && data?.score === 100 && !earnedBadgeIds.includes('perfect-score')) {
      this.awardBadge(user.id, 'perfect-score', data?.courseId, data?.score);
    }

    // Eğitmen rozeti
    if (action === 'course_created' && !earnedBadgeIds.includes('course-creator')) {
      this.awardBadge(user.id, 'course-creator');
    }

    // Sosyal öğrenen (5 farklı kurs)
    if (action === 'course_completed') {
      const uniqueCourses = new Set(achievements.filter(a => a.courseId).map(a => a.courseId));
      if (uniqueCourses.size >= 5 && !earnedBadgeIds.includes('social-learner')) {
        this.awardBadge(user.id, 'social-learner');
      }
    }
  }

  /** Liderlik tablosu */
  getLeaderboard(limit: number = 10): { user: User; score: number; level: number }[] {
    // Bu fonksiyon gerçek uygulamada backend'den gelecek
    // Şimdilik localStorage'daki kullanıcıları simüle ediyoruz
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    return users
      .map((user: User) => ({
        user,
        score: (user.experience || 0) + (user.coursesCompleted || 0) * 100,
        level: user.level || 1
      }))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit);
  }

  /** Kullanıcı istatistikleri */
  getUserStats(userId: string): {
    totalExp: number;
    level: number;
    badgesCount: number;
    coursesCompleted: number;
    averageScore: number;
    studyStreak: number;
  } {
    const user = JSON.parse(localStorage.getItem('users') || '[]').find((u: User) => u.id === userId);
    const achievements = this.getUserAchievements(userId);
    
    return {
      totalExp: user?.experience || 0,
      level: user?.level || 1,
      badgesCount: achievements.length,
      coursesCompleted: user?.coursesCompleted || 0,
      averageScore: user?.averageScore || 0,
      studyStreak: this.calculateStudyStreak(userId)
    };
  }

  private calculateStudyStreak(userId: string): number {
    // Basit streak hesaplama - gerçekte daha karmaşık olacak
    const achievements = this.getUserAchievements(userId);
    const recentAchievements = achievements
      .filter(a => new Date(a.earnedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .length;
    
    return Math.min(recentAchievements, 7); // Max 7 gün
  }
}
