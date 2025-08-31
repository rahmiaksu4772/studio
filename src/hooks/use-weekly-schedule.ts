
'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import type { WeeklyScheduleItem, Day, ScheduleSettings } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const dayOrder: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const getDefaultScheduleSettings = (): ScheduleSettings => ({
    schoolStartTime: '08:30',
    schoolEndTime: '17:30',
    lessonDuration: 40,
    breakDuration: 10,
    isLunchActive: true,
    lunchStartTime: '12:30',
    lunchEndTime: '13:30',
});

const getDefaultSchedule = (): WeeklyScheduleItem[] => {
    const defaultSettings = getDefaultScheduleSettings();
    return dayOrder.map(day => ({
        day,
        lessons: [],
        ...defaultSettings
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
        const defaultSettings = getDefaultScheduleSettings();
        if (docSnap.exists()) {
            const data = docSnap.data();
            const scheduleData: WeeklyScheduleItem[] = dayOrder.map(day => {
                const dayData = data[day] || {};
                return {
                    day: day,
                    lessons: dayData.lessons || [],
                    schoolStartTime: dayData.schoolStartTime || defaultSettings.schoolStartTime,
                    schoolEndTime: dayData.schoolEndTime || defaultSettings.schoolEndTime,
                    lessonDuration: dayData.lessonDuration === undefined ? defaultSettings.lessonDuration : dayData.lessonDuration,
                    breakDuration: dayData.breakDuration === undefined ? defaultSettings.breakDuration : dayData.breakDuration,
                    isLunchActive: dayData.isLunchActive === undefined ? defaultSettings.isLunchActive : dayData.isLunchActive,
                    lunchStartTime: dayData.lunchStartTime || defaultSettings.lunchStartTime,
                    lunchEndTime: dayData.lunchEndTime || defaultSettings.lunchEndTime,
                };
            });
            setScheduleState(scheduleData);
        } else {
             const defaultScheduleData = dayOrder.reduce((acc, day) => {
                acc[day] = {
                    lessons: [],
                    ...defaultSettings
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


  const setScheduleForDay = async (day: Day, dayData: Omit<WeeklyScheduleItem, 'day'>) => {
    if (!userId) return;

    const scheduleDocRef = doc(db, `users/${userId}/schedules`, scheduleDocId);

    try {
        await setDoc(scheduleDocRef, {
            [day]: dayData
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
  
  return { schedule, isLoading, setScheduleForDay };
}
