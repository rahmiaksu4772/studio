
'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import type { WeeklyScheduleItem, Lesson, Day } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, setDoc, onSnapshot } from 'firebase/firestore';


const dayOrder: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export function useWeeklySchedule(userId?: string) {
  const { toast } = useToast();
  const [schedule, setSchedule] = React.useState<WeeklyScheduleItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const scheduleId = "main-schedule"; // This is now a sub-document ID under the user

  React.useEffect(() => {
    if (!userId) {
        setSchedule(dayOrder.map(day => ({ day, lessons: [] })));
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    const scheduleDocRef = doc(db, `users/${userId}/schedules`, scheduleId);

    const unsubscribe = onSnapshot(scheduleDocRef, async (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const scheduleData: WeeklyScheduleItem[] = dayOrder.map(day => ({
                day,
                lessons: data[day] || []
            }));
            setSchedule(scheduleData);
        } else {
            // Document doesn't exist, create it with a default structure for the user
             const defaultSchedule = dayOrder.reduce((acc, day) => ({ ...acc, [day]: [] }), {});
             try {
                await setDoc(scheduleDocRef, defaultSchedule);
                setSchedule(dayOrder.map(day => ({ day, lessons: [] })));
             } catch (error) {
                console.error("Failed to create default schedule for user", error);
             }
        }
        setIsLoading(false);
    }, (error) => {
      console.error("Failed to load schedule from Firestore", error);
      toast({
        title: "Program Yüklenemedi",
        description: "Ders programı yüklenirken bir sorun oluştu.",
        variant: "destructive"
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId, toast]);


  const addLesson = async (day: Day, lessonData: Omit<Lesson, 'id'>) => {
    if (!userId) return;

    const newLesson: Lesson = {
        ...lessonData,
        id: new Date().toISOString(),
    };
    
    const scheduleDocRef = doc(db, `users/${userId}/schedules`, scheduleId);
    try {
        await updateDoc(scheduleDocRef, {
            [day]: arrayUnion(newLesson)
        });
        toast({
            title: "Ders Eklendi!",
            description: `"${lessonData.subject}" dersi ${day} gününe eklendi.`
        });
    } catch (error) {
        console.error("Error adding lesson:", error);
         toast({
            title: "Hata!",
            description: "Ders eklenirken bir hata oluştu.",
            variant: "destructive"
        });
    }
  };

  const deleteLesson = async (day: Day, lessonId: string) => {
     if (!userId) return;
     const daySchedule = schedule.find(d => d.day === day);
     const lessonToDelete = daySchedule?.lessons.find(l => l.id === lessonId);
     
     if (!lessonToDelete) return;

     const scheduleDocRef = doc(db, `users/${userId}/schedules`, scheduleId);
     try {
        await updateDoc(scheduleDocRef, {
            [day]: arrayRemove(lessonToDelete)
        });
        toast({
            title: "Ders Silindi!",
            description: `"${lessonToDelete.subject}" dersi programdan kaldırıldı.`,
            variant: 'destructive'
        });
     } catch (error) {
         console.error("Error deleting lesson:", error);
         toast({
            title: "Hata!",
            description: "Ders silinirken bir hata oluştu.",
            variant: "destructive"
        });
     }
  };
  
  return { schedule, isLoading, addLesson, deleteLesson };
}
