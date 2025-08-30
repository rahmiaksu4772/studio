
'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

export type UserProfile = {
  fullName: string;
  title: string;
  email: string;
  branch: string;
  workplace: string;
  avatarUrl: string;
};

const defaultProfile: UserProfile = {
  fullName: 'Ayşe Öğretmen',
  title: 'Matematik Öğretmeni',
  email: 'ornek.eposta@gmail.com',
  branch: 'Matematik',
  workplace: 'Atatürk İlkokulu',
  avatarUrl: 'https://placehold.co/96x96.png',
};

// For this single-user application, we'll use a fixed ID.
// In a multi-user app, this would be the authenticated user's ID.
const PROFILE_DOC_ID = 'default-user'; 

export function useUserProfile() {
  const { toast } = useToast();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    const profileDocRef = doc(db, 'profiles', PROFILE_DOC_ID);

    const unsubscribe = onSnapshot(profileDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Profile doesn't exist, create it with default data
        try {
          await setDoc(profileDocRef, defaultProfile);
          setProfile(defaultProfile);
        } catch (error) {
          console.error("Failed to create default profile:", error);
          toast({
            title: 'Profil Oluşturulamadı',
            description: 'Varsayılan kullanıcı profili oluşturulamadı.',
            variant: 'destructive',
          });
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
  }, [toast]);

  const updateProfile = async (updatedProfile: UserProfile) => {
    const profileDocRef = doc(db, 'profiles', PROFILE_DOC_ID);
    try {
      await updateDoc(profileDocRef, updatedProfile);
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
