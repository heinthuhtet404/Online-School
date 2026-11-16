import { Quiz } from "./quizzes-service";

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const TTL = 5 * 60 * 1000; // 5 minutes

const quizzesByGradeSubject = new Map<string, CacheEntry<Quiz[]>>();
const quizById = new Map<string, CacheEntry<Quiz>>();

function isExpired(entry: CacheEntry<unknown>) {
  return Date.now() - entry.timestamp > TTL;
}

export const QuizzesCache = {
  getList(grade: string, subject: string): Quiz[] | null {
    const key = `${grade}:${subject}`;
    const entry = quizzesByGradeSubject.get(key);
    if (!entry) return null;
    if (isExpired(entry)) {
      quizzesByGradeSubject.delete(key);
      return null;
    }
    return entry.data;
  },

  setList(grade: string, subject: string, quizzes: Quiz[]) {
    const key = `${grade}:${subject}`;
    quizzesByGradeSubject.set(key, {
      data: quizzes,
      timestamp: Date.now(),
    });
  },

  getQuiz(id: string): Quiz | null {
    const entry = quizById.get(id);
    if (!entry) return null;
    if (isExpired(entry)) {
      quizById.delete(id);
      return null;
    }
    return entry.data;
  },

  setQuiz(quiz: Quiz) {
    if (!quiz.id) return;
    quizById.set(quiz.id, { data: quiz, timestamp: Date.now() });
  },

  invalidateList(grade: string, subject: string) {
    quizzesByGradeSubject.delete(`${grade}:${subject}`);
  },

  invalidateQuiz(id: string) {
    quizById.delete(id);
  },

  invalidateAll(grade?: string, subject?: string) {
    if (grade && subject) {
      quizzesByGradeSubject.delete(`${grade}:${subject}`);
    } else {
      quizzesByGradeSubject.clear();
    }
    quizById.clear();
  },
};