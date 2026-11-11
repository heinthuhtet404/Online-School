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

// localStorage-like in-memory store
let STORE: Lesson[] = [
  {
    id: "l1",
    subject: "math",
    grade: "g3",
    title: "သင်ခန်းစာ ၁ - အခြေခံ ကိန်းဂဏန်း",
    youtubeUrl: "https://youtu.be/DDhdFSIW-MA",
    content: "ဒီသင်ခန်းစာမှာ အခြေခံ ကိန်းဂဏန်းတွေကို လေ့လာပါမယ်။",
    published: true,
    order: 1,
    updatedAt: "2026-11-08",
  },
  {
    id: "l2",
    subject: "math",
    grade: "g3",
    title: "သင်ခန်းစာ ၂ - ပေါင်းခြင်း",
    youtubeUrl: "https://youtu.be/DDhdFSIW-MA",
    content: "ပေါင်းခြင်း အခြေခံ သဘောတရား။",
    published: true,
    order: 2,
    updatedAt: "2026-11-08",
  },
];

export const LessonsStore = {
  getAll: () => [...STORE],
  getBySubject: (subject: string) =>
    STORE.filter((l) => l.subject === subject).sort((a, b) => a.order - b.order),
  get: (id: string) => STORE.find((l) => l.id === id),
  add: (lesson: Omit<Lesson, "id" | "updatedAt" | "order">) => {
    const id = `l${Date.now()}`;
    const maxOrder = Math.max(0, ...STORE.filter((l) => l.subject === lesson.subject).map((l) => l.order));
    STORE = [
      ...STORE,
      { ...lesson, id, order: maxOrder + 1, updatedAt: new Date().toISOString().slice(0, 10) },
    ];
    return id;
  },
  update: (id: string, updates: Partial<Lesson>) => {
    STORE = STORE.map((l) =>
      l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString().slice(0, 10) } : l
    );
  },
  delete: (id: string) => {
    STORE = STORE.filter((l) => l.id !== id);
  },
};