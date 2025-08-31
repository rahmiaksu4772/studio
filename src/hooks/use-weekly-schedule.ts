
'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import type { WeeklyScheduleItem, Day, Lesson } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const dayOrder: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const getDefaultSchedule = (): WeeklyScheduleItem[] => {
    return dayOrder.map(day => ({
        day,
        lessons: [],
    }));
}

export function useWeeklySchedule(userId?: string) {
  const { toast } = useToast();
  const [schedule, setScheduleState] = React.useState<WeeklyScheduleItem[]>(getDefaultSchedule());
  const [isLoading, setIsLoading] = React.useState(true);
  const scheduleDocId = "main-schedule"; 

  React.useEffect(() => {
    if (!userId) {
        setScheduleState(getDefaultSchedule());
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    const scheduleDocRef = doc(db, `users/${userId}/schedules`, scheduleDocId);

    const unsubscribe = onSnapshot(scheduleDocRef, async (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const scheduleData: WeeklyScheduleItem[] = dayOrder.map(day => {
                const dayData = data[day] || { lessons: [] };
                return {
                    day: day,
                    lessons: dayData.lessons || [],
                };
            });
            setScheduleState(scheduleData);
        } else {
             const defaultScheduleData = dayOrder.reduce((acc, day) => {
                acc[day] = {
                    lessons: [],
                };
                return acc;
            }, {} as { [key in Day]: any });

             try {
                await setDoc(scheduleDocRef, defaultScheduleData);
                setScheduleState(getDefaultSchedule());
             } catch (error) {
                console.error("Failed to create default schedule for user", error);
                toast({ title: "Hata!", description: "Varsayılan ders programı oluşturulamadı.", variant: "destructive" });
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


  const setLessonsForDay = async (day: Day, lessons: Lesson[]) => {
    if (!userId) return;

    const scheduleDocRef = doc(db, `users/${userId}/schedules`, scheduleDocId);

    try {
        await setDoc(scheduleDocRef, {
            [day]: { lessons }
        }, { merge: true });
    } catch (error) {
         console.error("Error updating day schedule:", error);
         toast({
            title: "Hata!",
            description: "Program güncellenirken bir hata oluştu.",
            variant: "destructive"
        });
    }
  };
  
  return { schedule, isLoading, setLessonsForDay };
}
