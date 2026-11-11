export type Lesson = {
  id: string;
  subject: string;
  grade: string;
  title: string;
  youtubeUrl: string;
  content: string;
  published: boolean;
  order: number;
  updatedAt: string;
};

let STORE: Lesson[] = [];

export const LessonsStore = {
  getAll: () => [...STORE],

  // ⭐ အတန်းနဲ့ ဘာသာရပ် နှစ်ခုလုံးကို တိုက်ဆိုင်စစ်ဆေးပြီးမှ ဆွဲထုတ်ပေးမယ်
  getByGradeAndSubject: (grade: string, subject: string) => {
    return STORE.filter((l) => l.grade === grade && l.subject === subject).sort(
      (a, b) => a.order - b.order
    );
  },

  get: (id: string) => STORE.find((l) => l.id === id),

  add: (lesson: Omit<Lesson, "id" | "updatedAt" | "order">) => {
    const id = `l${Date.now()}`;
    // ⭐ အတန်းနဲ့ ဘာသာရပ် တူတဲ့အထဲကနေပဲ Order အသစ်တွက်မယ်
    const sameGroup = STORE.filter(
      (l) => l.subject === lesson.subject && l.grade === lesson.grade
    );
    const maxOrder = sameGroup.length > 0 ? Math.max(...sameGroup.map((l) => l.order)) : 0;

    STORE = [
      ...STORE,
      {
        ...lesson,
        id,
        order: maxOrder + 1,
        updatedAt: new Date().toISOString().slice(0, 10),
      },
    ];
    return id;
  },

  update: (id: string, updates: Partial<Lesson>) => {
    STORE = STORE.map((l) =>
      l.id === id
        ? { ...l, ...updates, updatedAt: new Date().toISOString().slice(0, 10) }
        : l
    );
  },

  delete: (id: string) => {
    STORE = STORE.filter((l) => l.id !== id);
  },
};