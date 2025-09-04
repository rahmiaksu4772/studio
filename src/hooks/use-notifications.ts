
'use client';

import * as React from 'react';
import { db } from '@/lib/firebase';
import { 
    collection, 
    query, 
    orderBy, 
    onSnapshot, 
    doc,
    updateDoc,
    arrayUnion,
} from 'firebase/firestore';
import { useToast } from './use-toast';
import type { Notification } from '@/lib/types';
import { useUserProfile } from './use-user-profile';


export function useNotifications(userId?: string) {
  const { toast } = useToast();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const { profile } = useUserProfile(userId);

  React.useEffect(() => {
    if (!userId || !profile) {
      setIsLoading(false);
      return;
    }

    const notificationsQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const allNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      
      const readIds = new Set(profile.readNotificationIds || []);
      
      const processedNotifications = allNotifications.map(n => ({
        ...n,
        isRead: readIds.has(n.id),
      }));

      const newUnreadCount = processedNotifications.filter(n => !n.isRead).length;

      setNotifications(processedNotifications);
      setUnreadCount(newUnreadCount);
      setIsLoading(false);

    }, (error) => {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Bildirimler Yüklenemedi",
        variant: "destructive"
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId, profile, toast]);

  const markAsRead = async (notificationIds: string[]) => {
    if (!userId || notificationIds.length === 0) return;
    const userDocRef = doc(db, 'users', userId);
    try {
        // We use arrayUnion to safely add new IDs without creating duplicates.
        await updateDoc(userDocRef, {
            readNotificationIds: arrayUnion(...notificationIds)
        });
    } catch(error) {
        console.error("Error marking notifications as read:", error);
        toast({ title: "Hata", description: "Bildirimler okunmuş olarak işaretlenemedi.", variant: "destructive" });
    }
  }

  return { notifications, unreadCount, isLoading, markAsRead };
}
