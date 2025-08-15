import { Injectable } from '@angular/core';
import { Course } from '../models/course';
import { CourseService } from './course.service';

export interface DependencyNode {
  id: string;
  title: string;
  level: string;
  completed: boolean;
  canAccess: boolean;
  prerequisites: string[];
  dependents: string[];
  position: { x: number; y: number };
}

export interface DependencyFlow {
  nodes: DependencyNode[];
  connections: { from: string; to: string; type: 'prerequisite' | 'dependent' }[];
}

@Injectable({ providedIn: 'root' })
export class DependencyService {
  constructor(private courseService: CourseService) {}

  /** Kurs bağımlılık akış şemasını oluştur */
  createDependencyFlow(courseId: string, completedCourseIds: string[]): DependencyFlow {
    const course = this.courseService.get(courseId);
    if (!course) return { nodes: [], connections: [] };

    const nodes: DependencyNode[] = [];
    const connections: { from: string; to: string; type: 'prerequisite' | 'dependent' }[] = [];
    const processedIds = new Set<string>();

    // Ana kursu ekle
    nodes.push({
      id: course.id,
      title: course.title,
      level: course.level,
      completed: completedCourseIds.includes(course.id),
      canAccess: true,
      prerequisites: course.prerequisites || [],
      dependents: [],
      position: { x: 0, y: 0 }
    });
    processedIds.add(course.id);

    // Ön koşul kursları ekle
    if (course.prerequisites) {
      course.prerequisites.forEach((prereqId, index) => {
        const prereqCourse = this.courseService.get(prereqId);
        if (prereqCourse) {
          nodes.push({
            id: prereqCourse.id,
            title: prereqCourse.title,
            level: prereqCourse.level,
            completed: completedCourseIds.includes(prereqCourse.id),
            canAccess: completedCourseIds.includes(prereqCourse.id),
            prerequisites: prereqCourse.prerequisites || [],
            dependents: [course.id],
            position: { x: -200, y: -100 + index * 80 }
          });
          processedIds.add(prereqCourse.id);

          // Bağlantı ekle
          connections.push({
            from: prereqCourse.id,
            to: course.id,
            type: 'prerequisite'
          });
        }
      });
    }

    // Bu kursa bağımlı olan kursları bul
    const allCourses = this.courseService.list();
    allCourses.forEach(depCourse => {
      if (depCourse.prerequisites && depCourse.prerequisites.includes(course.id)) {
        if (!processedIds.has(depCourse.id)) {
          nodes.push({
            id: depCourse.id,
            title: depCourse.title,
            level: depCourse.level,
            completed: completedCourseIds.includes(depCourse.id),
            canAccess: completedCourseIds.includes(course.id),
            prerequisites: depCourse.prerequisites || [],
            dependents: [],
            position: { x: 200, y: 0 }
          });
          processedIds.add(depCourse.id);
        }

        // Bağlantı ekle
        connections.push({
          from: course.id,
          to: depCourse.id,
          type: 'dependent'
        });
      }
    });

    // Pozisyonları optimize et
    this.optimizePositions(nodes, connections);

    return { nodes, connections };
  }

  /** Pozisyonları optimize et - çakışmaları önle */
  private optimizePositions(nodes: DependencyNode[], connections: any[]): void {
    // Basit pozisyon optimizasyonu
    nodes.forEach((node, index) => {
      if (index === 0) return; // Ana kurs pozisyonu sabit

      // Çakışan pozisyonları kontrol et
      let attempts = 0;
      while (attempts < 10) {
        const hasConflict = nodes.some((otherNode, otherIndex) => {
          if (index === otherIndex) return false;
          const distance = Math.sqrt(
            Math.pow(node.position.x - otherNode.position.x, 2) +
            Math.pow(node.position.y - otherNode.position.y, 2)
          );
          return distance < 150; // Minimum mesafe
        });

        if (!hasConflict) break;

        // Pozisyonu değiştir
        node.position.x += (Math.random() - 0.5) * 100;
        node.position.y += (Math.random() - 0.5) * 100;
        attempts++;
      }
    });
  }

  /** Kurs yolunu hesapla - en kısa yol */
  calculateLearningPath(targetCourseId: string, completedCourseIds: string[]): string[] {
    const target = this.courseService.get(targetCourseId);
    if (!target) return [];

    const path: string[] = [];
    const visited = new Set<string>();

    const dfs = (courseId: string): boolean => {
      if (visited.has(courseId)) return false;
      visited.add(courseId);

      const course = this.courseService.get(courseId);
      if (!course) return false;

      // Eğer kurs zaten tamamlanmışsa, bu yolu kullan
      if (completedCourseIds.includes(courseId)) {
        path.push(courseId);
        return true;
      }

      // Ön koşulları kontrol et
      if (course.prerequisites && course.prerequisites.length > 0) {
        for (const prereqId of course.prerequisites) {
          if (dfs(prereqId)) {
            path.push(courseId);
            return true;
          }
        }
      } else {
        // Ön koşul yoksa direkt ekle
        path.push(courseId);
        return true;
      }

      return false;
    };

    dfs(targetCourseId);
    return path.reverse(); // Yolu doğru sıraya çevir
  }

  /** Tahmini tamamlama süresini hesapla */
  estimateCompletionTime(courseId: string, completedCourseIds: string[]): {
    totalHours: number;
    remainingHours: number;
    estimatedWeeks: number;
    canStart: boolean;
    missingPrerequisites: string[];
  } {
    const course = this.courseService.get(courseId);
    if (!course) {
      return { totalHours: 0, remainingHours: 0, estimatedWeeks: 0, canStart: false, missingPrerequisites: [] };
    }

    // Ön koşul kontrolü
    const missingPrerequisites = (course.prerequisites || []).filter(
      prereqId => !completedCourseIds.includes(prereqId)
    );

    const canStart = missingPrerequisites.length === 0;
    const totalHours = course.estimatedHours;
    const remainingHours = canStart ? totalHours : 0;

    // Haftalık çalışma süresi varsayımı (5 saat)
    const weeklyStudyHours = 5;
    const estimatedWeeks = Math.ceil(remainingHours / weeklyStudyHours);

    return {
      totalHours,
      remainingHours,
      estimatedWeeks,
      canStart,
      missingPrerequisites
    };
  }

  /** Bağımlılık grafiği için SVG path oluştur */
  createConnectionPath(from: { x: number; y: number }, to: { x: number; y: number }): string {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    
    // Bezier curve ile bağlantı
    const controlPoint1 = { x: from.x + dx * 0.5, y: from.y };
    const controlPoint2 = { x: to.x - dx * 0.5, y: to.y };
    
    return `M ${from.x} ${from.y} C ${controlPoint1.x} ${controlPoint1.y} ${controlPoint2.x} ${controlPoint2.y} ${to.x} ${to.y}`;
  }

  /** Kurs karmaşıklık skorunu hesapla */
  calculateComplexityScore(courseId: string): number {
    const course = this.courseService.get(courseId);
    if (!course) return 0;

    let score = 0;

    // Seviye bazlı karmaşıklık
    switch (course.level) {
      case 'beginner': score += 1; break;
      case 'intermediate': score += 3; break;
      case 'advanced': score += 5; break;
    }

    // Ön koşul sayısı
    score += (course.prerequisites?.length || 0) * 2;

    // Modül sayısı
    score += (course.modules?.length || 0) * 0.5;

    // Tahmini süre
    score += Math.min(course.estimatedHours / 2, 5);

    // Zorluk skoru
    if (course.difficulty) {
      score += course.difficulty;
    }

    return Math.min(score, 10); // Max 10
  }

  /** Öğrenme yolunu görselleştir */
  visualizeLearningPath(path: string[]): {
    nodes: { id: string; title: string; status: 'completed' | 'current' | 'upcoming' }[];
    connections: { from: string; to: string }[];
  } {
    const nodes = path.map((courseId, index) => {
      const course = this.courseService.get(courseId);
      let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
      
      if (index === 0) status = 'current';
      else if (index < path.length - 1) status = 'upcoming';
      else status = 'completed';

      return {
        id: courseId,
        title: course?.title || 'Bilinmeyen Kurs',
        status
      };
    });

    const connections = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      connections.push({
        from: nodes[i].id,
        to: nodes[i + 1].id
      });
    }

    return { nodes, connections };
  }
}
