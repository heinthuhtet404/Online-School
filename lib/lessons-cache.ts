import { Lesson } from "./lessons-service";

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const TTL = 5 * 60 * 1000; // 5 minutes

const lessonsByGradeSubject = new Map<string, CacheEntry<Lesson[]>>();
const lessonById = new Map<string, CacheEntry<Lesson>>();

function isExpired(entry: CacheEntry<unknown>) {
  return Date.now() - entry.timestamp > TTL;
}

export const LessonsCache = {
  getList(grade: string, subject: string): Lesson[] | null {
    const key = `${grade}:${subject}`;
    const entry = lessonsByGradeSubject.get(key);
    if (!entry) return null;
    if (isExpired(entry)) {
      lessonsByGradeSubject.delete(key);
      return null;
    }
    return entry.data;
  },

  setList(grade: string, subject: string, lessons: Lesson[]) {
    const key = `${grade}:${subject}`;
    lessonsByGradeSubject.set(key, {
      data: lessons,
      timestamp: Date.now(),
    });
  },

  getLesson(id: string): Lesson | null {
    const entry = lessonById.get(id);
    if (!entry) return null;
    if (isExpired(entry)) {
      lessonById.delete(id);
      return null;
    }
    return entry.data;
  },

  setLesson(lesson: Lesson) {
    if (!lesson.id) return;
    lessonById.set(lesson.id, { data: lesson, timestamp: Date.now() });
  },

  invalidateList(grade: string, subject: string) {
    lessonsByGradeSubject.delete(`${grade}:${subject}`);
  },

  invalidateLesson(id: string) {
    lessonById.delete(id);
  },

  invalidateAll(grade?: string, subject?: string) {
    if (grade && subject) {
      lessonsByGradeSubject.delete(`${grade}:${subject}`);
    } else {
      lessonsByGradeSubject.clear();
    }
    lessonById.clear();
  },
};