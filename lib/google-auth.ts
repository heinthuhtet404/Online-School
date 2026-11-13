import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

WebBrowser.maybeCompleteAuthSession();

// ⚠️ ဒီနေရာမှာ သင့်ရဲ့ Web Client ID ကို ထည့်ပါ
export const GOOGLE_WEB_CLIENT_ID = "842719845835-jrrgdorupe1qhnuilg3s0up67pgi5gdq.apps.googleusercontent.com";
export const GOOGLE_ANDROID_CLIENT_ID = "842719845835-3esmllbbeqq0sfdrhll18mqb43c0cusu.apps.googleusercontent.com";

export async function handleGoogleSignIn(idToken: string, accessToken?: string) {
  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  const userCredential = await signInWithCredential(auth, credential);
  const user = userCredential.user;

  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    await setDoc(docRef, {
      name: user.displayName || "Student",
      email: user.email,
      phone: user.phoneNumber || "",
      role: "student",
      grade: "g1", // Default
      isPremium: false,
      provider: "google",
      createdAt: new Date().toISOString(),
    });
  }

  return user;
}