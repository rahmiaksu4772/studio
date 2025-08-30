
'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  getAuth,
  type User,
} from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { UserProfile } from './use-user-profile';

const auth = getAuth(app);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, pass: string, profileData: { workplace: string, hometown: string }) => Promise<void>;
  logIn: (email: string, pass: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createInitialUserProfile = async (userId: string, email: string, profileData: { workplace: string, hometown: string }) => {
    const userProfileRef = doc(db, 'users', userId);
    const newProfile: Omit<UserProfile, 'email'> & { email: string; hometown: string; } = {
        fullName: 'Yeni Kullanıcı',
        title: 'Öğretmen',
        branch: 'Belirtilmemiş',
        avatarUrl: `https://placehold.co/96x96.png`,
        email: email,
        workplace: profileData.workplace,
        hometown: profileData.hometown,
    };
    await setDoc(userProfileRef, newProfile);
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, pass: string, profileData: { workplace: string, hometown: string }) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      // After user is created in Auth, create their profile in Firestore
      await createInitialUserProfile(userCredential.user.uid, email, profileData);
    } catch (err: any) {
      setError(mapFirebaseAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const logIn = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setError(mapFirebaseAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    setError(null);
    try {
        await signOut(auth);
    } catch (err: any) {
        setError(mapFirebaseAuthError(err.code));
    } finally {
        setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    logIn,
    logOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to provide user-friendly error messages
function mapFirebaseAuthError(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Geçersiz e-posta adresi formatı.';
      case 'auth/user-disabled':
        return 'Bu kullanıcı hesabı devre dışı bırakılmış.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'E-posta veya şifre yanlış.';
      case 'auth/email-already-in-use':
        return 'Bu e-posta adresi zaten başka bir hesap tarafından kullanılıyor.';
      case 'auth/weak-password':
        return 'Şifre çok zayıf. Lütfen en az 6 karakter kullanın.';
      default:
        return 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
  }
