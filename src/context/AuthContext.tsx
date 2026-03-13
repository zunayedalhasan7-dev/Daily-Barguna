import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut } from "firebase/auth";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // Mock Auth for preview if Firebase is not configured
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, pass: string) => {
    if (auth) {
      await signInWithEmailAndPassword(auth, email, pass);
    } else {
      // Mock login
      if ((email === "xpeee01@gmail.com" || email === "zunayedalhasan7@gmail.com") && pass === "Xpzunayed123!") {
        setCurrentUser({ email, uid: "mock-admin-uid" } as User);
      } else {
        throw new Error("Invalid credentials");
      }
    }
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    } else {
      setCurrentUser(null);
    }
  };

  const value = { currentUser, loading, login, logout };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
