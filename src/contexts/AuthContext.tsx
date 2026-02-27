import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, get, set } from "firebase/database";
// @ts-ignore - firebase.js is a JS module
import { auth, db } from "../firebase";

/* ================= TYPES ================= */

interface User {
  uid: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

/* ================= PROVIDER ================= */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔍 AuthProvider: Setting up auth listener");
    
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log("🔔 onAuthStateChanged fired:", firebaseUser ? `User: ${firebaseUser.email}` : "No user");
        
        if (firebaseUser) {
          try {
            // 🔹 Fetch user profile from Realtime Database
            const userRef = ref(db, `users/${firebaseUser.uid}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
              const profile = snapshot.val();

              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                name: profile.name || "Admin",
                role: profile.role || "user",
                avatar: profile.avatar || undefined,
              });
            } else {
              // ⚠️ Profile missing (common right after registration due to race)
              // Create a minimal default profile, then proceed
              const defaultName = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : "User");
              const defaultProfile = {
                name: defaultName,
                email: firebaseUser.email || "",
                role: "user",
              };
              try {
                await set(userRef, defaultProfile);
              } catch (e) {
                console.warn("Could not create default profile, proceeding with fallback:", e);
              }
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                name: defaultName,
                role: defaultProfile.role,
                avatar: undefined,
              });
            }
          } catch (error) {
            console.error("❌ Error fetching user profile:", error);
            // Even if profile fetch fails, keep the session as a basic user
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : "User"),
              role: "user",
            });
          }
        } else {
          // 🔹 User logged out
          setUser(null);
        }

        console.log("✅ AuthProvider: Loading complete");
        setLoading(false);
      });

      return () => {
        console.log("🔍 AuthProvider: Cleaning up auth listener");
        unsubscribe();
      };
    } catch (err) {
      console.error("❌ AuthProvider: Firebase initialization error:", err);
      setLoading(false);
    }
  }, []);

  /* ================= LOGOUT ================= */

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const register = async (name: string, email: string, password: string) => {
    // Create account in Firebase Auth
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    // Update Firebase Auth displayName
    await updateProfile(credential.user, { displayName: name });

    // Persist basic profile in Realtime Database
    const userRef = ref(db, `users/${uid}`);
    await set(userRef, {
      name,
      email,
      role: "user",
    });
    // onAuthStateChanged will populate context user afterwards
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};