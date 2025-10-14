"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useFirebase } from '@/lib/firebase-client';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext<User | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { app } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!app) return;
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [app]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): User | null => {
  return useContext(AuthContext);
};
