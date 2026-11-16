import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { QuizzesCache } from "./quizzes-cache";

export type QuizQuestion = {
  question: string;
  choices: string[];       // 4 choices
  correctIndex: number;    // 0-3
};

export type Quiz = {
  id?: string;
  grade: string;
  subject: string;
  title: string;
  questions: QuizQuestion[];
  published: boolean;
  isPremium: boolean;
  teacherId?: string;
  createdAt?: any;
  updatedAt?: any;
};

const COLLECTION = "quizzes";

// ===== Create =====
export async function addQuiz(
  quiz: Omit<Quiz, "id" | "teacherId" | "createdAt" | "updatedAt">
) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...quiz,
    teacherId: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  QuizzesCache.invalidateList(quiz.grade, quiz.subject);
  return docRef.id;
}

// ===== Read — by grade and subject (teacher) =====
export async function getQuizzesByGradeAndSubject(
  grade: string,
  subject: string
) {
  const cached = QuizzesCache.getList(grade, subject);
  if (cached) {
    console.log("✅ Cache HIT (quiz list):", grade, subject);
    return cached;
  }

  console.log("🌐 Firestore fetch (quiz list):", grade, subject);
  const q = query(
    collection(db, COLLECTION),
    where("grade", "==", grade),
    where("subject", "==", subject)
  );
  const snapshot = await getDocs(q);
  const quizzes = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Quiz[];

  QuizzesCache.setList(grade, subject, quizzes);
  return quizzes;
}

// ===== Read — published only (student) =====
export async function getPublishedQuizzes(grade: string, subject: string) {
  const cached = QuizzesCache.getList(grade, subject);
  if (cached) {
    console.log("✅ Cache HIT (published quizzes):", grade, subject);
    return cached.filter((q) => q.published);
  }

  console.log("🌐 Firestore fetch (published quizzes):", grade, subject);
  const q = query(
    collection(db, COLLECTION),
    where("grade", "==", grade),
    where("subject", "==", subject),
    where("published", "==", true)
  );
  const snapshot = await getDocs(q);
  const quizzes = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Quiz[];

  QuizzesCache.setList(grade, subject, quizzes);
  return quizzes;
}

// ===== Read — all published (for student quiz tab, no grade filter) =====
export async function getAllPublishedQuizzes() {
  const q = query(
    collection(db, COLLECTION),
    where("published", "==", true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Quiz[];
}

// ===== Read — single =====
export async function getQuiz(id: string) {
  const cached = QuizzesCache.getQuiz(id);
  if (cached) {
    console.log("✅ Cache HIT (quiz single):", id);
    return cached;
  }

  console.log("🌐 Firestore fetch (quiz single):", id);
  const docRef = doc(db, COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  const quiz = { id: snap.id, ...snap.data() } as Quiz;

  QuizzesCache.setQuiz(quiz);
  return quiz;
}

// ===== Update =====
export async function updateQuiz(id: string, updates: Partial<Quiz>) {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  QuizzesCache.invalidateQuiz(id);
  if (updates.grade && updates.subject) {
    QuizzesCache.invalidateList(updates.grade, updates.subject);
  } else {
    QuizzesCache.invalidateAll();
  }
}

// ===== Delete =====
export async function deleteQuiz(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));

  QuizzesCache.invalidateQuiz(id);
  QuizzesCache.invalidateAll();
}