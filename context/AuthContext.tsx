'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { onAuthStateChanged } = require('firebase/auth') as typeof import('firebase/auth');
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const setAuthCookie = () => {
    document.cookie = 'auth-token=true;path=/';
  };

  const removeAuthCookie = () => {
    document.cookie = 'auth-token=;Max-Age=0;path=/';
  };

  const signIn = async (email: string, password: string) => {
    const { signInWithEmailAndPassword } = require('firebase/auth') as typeof import('firebase/auth');
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    setAuthCookie();
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { createUserWithEmailAndPassword, updateProfile } = require('firebase/auth') as typeof import('firebase/auth');
    const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    await updateProfile(cred.user, { displayName: name });
    setAuthCookie();
  };

  const signInWithGoogle = async () => {
    const { signInWithPopup, GoogleAuthProvider } = require('firebase/auth') as typeof import('firebase/auth');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(getFirebaseAuth(), provider);
    setAuthCookie();
  };

  const signOut = async () => {
    const { signOut: firebaseSignOut } = require('firebase/auth') as typeof import('firebase/auth');
    await firebaseSignOut(getFirebaseAuth());
    removeAuthCookie();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
