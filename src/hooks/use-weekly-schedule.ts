
'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import type { WeeklyScheduleItem, Day } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const dayOrder: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const getDefaultSchedule = (): WeeklyScheduleItem[] => {
    return dayOrder.map(day => ({
        day,
        lessons: [],
        startTime: '09:00',
        lessonDuration: 40,
        breakDuration: 10
    }));
}

export function useWeeklySchedule(userId?: string) {
  const { toast } = useToast();
  const [schedule, setScheduleState] = React.useState<WeeklyScheduleItem[]>(getDefaultSchedule());
  const [isLoading, setIsLoading] = React.useState(true);
  const scheduleDocId = "main-schedule"; // Using a single document to hold the entire week's schedule object

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
                // Merge saved data with defaults to ensure all fields are present
                const dayData = data[day] || {};
                return {
                    day: day,
                    lessons: dayData.lessons || [],
                    startTime: dayData.startTime || '09:00',
                    lessonDuration: dayData.lessonDuration || 40,
                    breakDuration: dayData.breakDuration || 10
                };
            });
            setScheduleState(scheduleData);
        } else {
            // Document doesn't exist, create it with a default structure for the user
             const defaultScheduleData = dayOrder.reduce((acc, day) => {
                acc[day] = {
                    lessons: [],
                    startTime: '09:00',
                    lessonDuration: 40,
                    breakDuration: 10
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


  const updateDaySchedule = async (day: Day, dayData: Omit<WeeklyScheduleItem, 'day'>) => {
    if (!userId) return;

    const scheduleDocRef = doc(db, `users/${userId}/schedules`, scheduleDocId);

    try {
        await setDoc(scheduleDocRef, {
            [day]: dayData
        }, { merge: true }); // Use merge to only update the specific day's data
    } catch (error) {
         console.error("Error updating day schedule:", error);
         toast({
            title: "Hata!",
            description: "Program güncellenirken bir hata oluştu.",
            variant: "destructive"
        });
    }
  };
  
  return { schedule, isLoading, updateDaySchedule };
}
