
'use client';

import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';
import { doc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db, messaging } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';


export function useFCM() {
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (typeof window === 'undefined' || !messaging) {
            return;
        }

        const requestPermissionAndToken = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted' && user?.uid) {
                    const currentToken = await getToken(messaging, {
                        vapidKey: 'BBRD-BGDLp88LJGzT92D8uSg9RxiwBqEvT9b9PMQae5Wk8y4g2I5rA8eX3xIeFUKo81g3H3A3sYV8zogY6D1_N0', // Replace with your key
                    });
                    
                    if (currentToken) {
                        // Check if token already exists for the user to avoid duplicates
                        const userDocRef = doc(db, 'users', user.uid);
                        const unsub = onSnapshot(userDocRef, async (docSnap) => {
                            if(docSnap.exists()){
                                const profile = docSnap.data() as UserProfile;
                                if (!profile.fcmTokens || !profile.fcmTokens.includes(currentToken)) {
                                    await updateDoc(userDocRef, {
                                        fcmTokens: arrayUnion(currentToken)
                                    });
                                }
                            }
                        });
                        // Detach listener after first check
                        return () => unsub();
                    } else {
                        console.log('No registration token available. Request permission to generate one.');
                    }
                }
            } catch (error) {
                console.error('An error occurred while retrieving token. ', error);
                toast({
                    title: "Bildirim Hatası",
                    description: "Anlık bildirimler için gerekli token alınamadı.",
                    variant: 'destructive',
                });
            }
        };

        if (user) {
            requestPermissionAndToken();
        }

        const unsubscribeOnMessage = onMessage(messaging, (payload) => {
            console.log('Message received. ', payload);
            toast({
                title: payload.notification?.title,
                description: payload.notification?.body,
            });
        });

        return () => {
            unsubscribeOnMessage();
        };

    }, [user, toast]);
}
