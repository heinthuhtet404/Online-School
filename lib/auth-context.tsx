import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export type UserRole = "student" | "teacher" | "admin";

export type UserData = {
  uid: string;
  email: string | null;
  role: UserRole;
  name: string;
  grade?: string;
  isPremium?: boolean;
};

type AuthContextType = {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Firestore ကနေ သူ့ရဲ့ Role နဲ့ Data တွေကို ဆွဲယူမယ်
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserData({
              uid: currentUser.uid,
              email: currentUser.email,
              ...(docSnap.data() as Omit<UserData, "uid" | "email">),
            });
          }
        } catch (error) {
          console.log("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);