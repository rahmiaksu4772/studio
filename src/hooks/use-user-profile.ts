
'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuth } from './use-auth';

export type UserProfile = {
  fullName: string;
  title: string;
  email: string;
  branch: string;
  workplace: string;
  avatarUrl: string;
};

const defaultProfile: Omit<UserProfile, 'email'> = {
  fullName: 'Yeni Kullanıcı',
  title: 'Öğretmen',
  branch: 'Belirtilmemiş',
  workplace: 'Belirtilmemiş',
  avatarUrl: `https://placehold.co/96x96.png`,
};

export function useUserProfile(userId?: string) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      setProfile(null);
      return;
    }

    setIsLoading(true);
    const profileDocRef = doc(db, 'users', userId);

    const unsubscribe = onSnapshot(profileDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Profile doesn't exist, create it with default data for the new user
        if (user?.email) {
          try {
            const newProfile: UserProfile = {
              ...defaultProfile,
              email: user.email,
            };
            await setDoc(profileDocRef, newProfile);
            setProfile(newProfile);
          } catch (error) {
            console.error("Failed to create default profile:", error);
            toast({
              title: 'Profil Oluşturulamadı',
              description: 'Varsayılan kullanıcı profili oluşturulamadı.',
              variant: 'destructive',
            });
          }
        }
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Failed to load profile from Firestore", error);
      toast({
        title: 'Profil Yüklenemedi',
        description: 'Profil bilgileriniz yüklenirken bir sorun oluştu.',
        variant: 'destructive',
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId, user?.email, toast]);

  const updateProfile = async (updatedProfile: UserProfile) => {
    if (!userId) return;
    const profileDocRef = doc(db, 'users', userId);
    try {
      await setDoc(profileDocRef, updatedProfile, { merge: true });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Profil Güncellenemedi',
        description: 'Profiliniz güncellenirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  return { profile, isLoading, updateProfile };
}
