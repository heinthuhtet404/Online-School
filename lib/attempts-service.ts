import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  increment,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "./firebase";

export type Attempt = {
  id?: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  grade: string;
  subject: string;
  score: number;
  total: number;
  answers: number[];
  completedAt?: any;
};

export type LeaderboardEntry = {
  uid: string;
  name: string;
  totalScore: number;
  quizzesTaken: number;
  photoURL?: string;
};

const ATTEMPTS = "attempts";
const USERS = "users";

// ===== Submit attempt + update totalScore =====
// ⭐ Guest (not logged in) → null ပြန်၊ Firestore မထိ
export async function submitAttempt(params: {
  quizId: string;
  quizTitle: string;
  grade: string;
  subject: string;
  score: number;
  total: number;
  answers: number[];
}) {
  const user = auth.currentUser;

  // ⭐ Guest — ဘာမှ မသိမ်းဘူး
  if (!user) {
    console.log("👤 Guest attempt — not saved to Firestore");
    return null;
  }

  // 1. Attempt သိမ်း
  const docRef = await addDoc(collection(db, ATTEMPTS), {
    userId: user.uid,
    quizId: params.quizId,
    quizTitle: params.quizTitle,
    grade: params.grade,
    subject: params.subject,
    score: params.score,
    total: params.total,
    answers: params.answers,
    completedAt: serverTimestamp(),
  });

  // 2. users/{uid} မှာ totalScore ကို increment
  const userRef = doc(db, USERS, user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    await updateDoc(userRef, {
      totalScore: increment(params.score),
      quizzesTaken: increment(1),
    });
  } else {
    // user doc မရှိသေးရင် setDoc နဲ့ ဖန်တီး
    await setDoc(
      userRef,
      {
        totalScore: params.score,
        quizzesTaken: 1,
        role: "student",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  return docRef.id;
}

// ===== Get my attempts =====
// ⭐ Guest → [] ပြန်
export async function getMyAttempts(): Promise<Attempt[]> {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, ATTEMPTS),
    where("userId", "==", user.uid),
    orderBy("completedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Attempt[];
}

// ===== Check if already attempted =====
// ⭐ Guest → false
export async function hasAttempted(quizId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  const q = query(
    collection(db, ATTEMPTS),
    where("userId", "==", user.uid),
    where("quizId", "==", quizId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// ===== Best score for a quiz =====
// ⭐ Guest → 0
export async function getBestScore(quizId: string): Promise<number> {
  const user = auth.currentUser;
  if (!user) return 0;

  const q = query(
    collection(db, ATTEMPTS),
    where("userId", "==", user.uid),
    where("quizId", "==", quizId)
  );
  const snapshot = await getDocs(q);
  let best = 0;
  snapshot.forEach((d) => {
    const s = d.data().score ?? 0;
    if (s > best) best = s;
  });
  return best;
}

// ===== Leaderboard — top students by totalScore =====
export async function getLeaderboard(max = 50): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, USERS),
    where("role", "==", "student"),
    orderBy("totalScore", "desc"),
    limit(max)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      name: data.name ?? "Student",
      totalScore: data.totalScore ?? 0,
      quizzesTaken: data.quizzesTaken ?? 0,
      photoURL: data.photoURL,
    };
  });
}

// ===== Current user rank =====
// ⭐ Guest → null
export async function getMyRank(): Promise<{
  rank: number;
  totalScore: number;
  total: number;
} | null> {
  const user = auth.currentUser;
  if (!user) return null;

  const board = await getLeaderboard(1000);
  const myIndex = board.findIndex((e) => e.uid === user.uid);
  if (myIndex === -1) {
    return { rank: 0, totalScore: 0, total: board.length };
  }
  return {
    rank: myIndex + 1,
    totalScore: board[myIndex].totalScore,
    total: board.length,
  };
}