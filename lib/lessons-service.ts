import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { LessonsCache } from "./lessons-cache";

export type Lesson = {
  id?: string;
  grade: string;
  subject: string;
  title: string;
  youtubeUrl: string;
  content: string;
  order: number;
  isPremium: boolean;
  published: boolean;
  teacherId?: string;
  createdAt?: any;
  updatedAt?: any;
};

const COLLECTION = "lessons";

// ===== Create =====
export async function addLesson(
  lesson: Omit<Lesson, "id" | "teacherId" | "createdAt" | "updatedAt">
) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...lesson,
    teacherId: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // ⭐ Cache ဖျက်
  LessonsCache.invalidateList(lesson.grade, lesson.subject);

  return docRef.id;
}

// ===== Read — by grade and subject (teacher) =====
export async function getLessonsByGradeAndSubject(
  grade: string,
  subject: string
) {
  // ⭐ Cache စစ်
  const cached = LessonsCache.getList(grade, subject);
  if (cached) {
    console.log("✅ Cache HIT (list):", grade, subject);
    return cached;
  }

  console.log("🌐 Firestore fetch (list):", grade, subject);
  const q = query(
    collection(db, COLLECTION),
    where("grade", "==", grade),
    where("subject", "==", subject),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  const lessons = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Lesson[];

  LessonsCache.setList(grade, subject, lessons);
  return lessons;
}

// ===== Read — published only (student) =====
export async function getPublishedLessons(grade: string, subject: string) {
  // ⭐ Cache စစ်
  const cached = LessonsCache.getList(grade, subject);
  if (cached) {
    console.log("✅ Cache HIT (published):", grade, subject);
    return cached.filter((l) => l.published);
  }

  console.log("🌐 Firestore fetch (published):", grade, subject);
  const q = query(
    collection(db, COLLECTION),
    where("grade", "==", grade),
    where("subject", "==", subject),
    where("published", "==", true)
  );
  const snapshot = await getDocs(q);
  const lessons = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Lesson[];
  const sorted = lessons.sort((a, b) => a.order - b.order);

  // Cache မှာ သိမ်း (published filter ကို Client-side မှာ လုပ်မယ်)
  LessonsCache.setList(grade, subject, sorted);
  return sorted;
}

// ===== Read — single =====
export async function getLesson(id: string) {
  // ⭐ Cache စစ်
  const cached = LessonsCache.getLesson(id);
  if (cached) {
    console.log("✅ Cache HIT (single):", id);
    return cached;
  }

  console.log("🌐 Firestore fetch (single):", id);
  const docRef = doc(db, COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  const lesson = { id: snap.id, ...snap.data() } as Lesson;

  LessonsCache.setLesson(lesson);
  return lesson;
}

// ===== Update =====
export async function updateLesson(id: string, updates: Partial<Lesson>) {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  // ⭐ Cache ဖျက်
  LessonsCache.invalidateLesson(id);
  if (updates.grade && updates.subject) {
    LessonsCache.invalidateList(updates.grade, updates.subject);
  } else {
    LessonsCache.invalidateAll();
  }
}

// ===== Delete =====
export async function deleteLesson(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));

  // ⭐ Cache ဖျက်
  LessonsCache.invalidateLesson(id);
  LessonsCache.invalidateAll();
}