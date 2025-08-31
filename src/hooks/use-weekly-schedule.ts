
'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import type { WeeklyScheduleItem, Day, Lesson, DaySchedule } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const dayOrder: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const getDefaultDaySchedule = (): DaySchedule => ({
    schoolStartTime: '08:30',
    schoolEndTime: '17:30',
    lessonDuration: 40,
    breakDuration: 10,
    lunchStartTime: '12:30',
    lunchEndTime: '13:30',
    lunchIsActive: true,
    lessons: [],
});

const getDefaultSchedule = (): WeeklyScheduleItem[] => {
    return dayOrder.map(day => ({
        day,
        schedule: getDefaultDaySchedule(),
    }));
}

export function useWeeklySchedule(userId?: string) {
  const { toast } = useToast();
  const [schedule, setScheduleState] = React.useState<WeeklyScheduleItem[]>(getDefaultSchedule());
  const [isLoading, setIsLoading] = React.useState(true);
  const scheduleDocId = "main-schedule-v2"; 

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
                const dayData = data[day] || getDefaultDaySchedule();
                return {
                    day: day,
                    schedule: { ...getDefaultDaySchedule(), ...dayData },
                };
            });
            setScheduleState(scheduleData);
        } else {
             const defaultScheduleData = dayOrder.reduce((acc, day) => {
                acc[day] = getDefaultDaySchedule();
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


  const setDaySchedule = async (day: Day, newSchedule: DaySchedule) => {
    if (!userId) return;

    const scheduleDocRef = doc(db, `users/${userId}/schedules`, scheduleDocId);

    try {
        await setDoc(scheduleDocRef, {
            [day]: newSchedule
        }, { merge: true });
        toast({ title: "Başarılı!", description: `${day} günü zamanlaması güncellendi.`});
    } catch (error) {
         console.error("Error updating day schedule:", error);
         toast({
            title: "Hata!",
            description: "Program güncellenirken bir hata oluştu.",
            variant: "destructive"
        });
    }
  };
  
  return { schedule, isLoading, setDaySchedule };
}
