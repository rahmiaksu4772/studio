
'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import type { WeeklyScheduleItem, Day, Lesson, ScheduleSettings } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';

const dayOrder: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const getDefaultSchedule = (): WeeklyScheduleItem[] => {
    return dayOrder.map(day => ({
        day,
        lessons: [],
    }));
};

const defaultSettings: ScheduleSettings = {
    timeSlots: ['08:30', '09:20', '10:10', '11:00', '11:50', '13:30', '14:20', '15:10'],
    lessonDuration: 40,
};

export function useWeeklySchedule(userId?: string) {
  const { toast } = useToast();
  const [schedule, setScheduleState] = React.useState<WeeklyScheduleItem[]>(getDefaultSchedule());
  const [settings, setSettings] = React.useState<ScheduleSettings>(defaultSettings);
  const [isLoading, setIsLoading] = React.useState(true);
  const scheduleDocId = "weekly-lessons-schedule"; 

  React.useEffect(() => {
    if (!userId) {
        setScheduleState(getDefaultSchedule());
        setSettings(defaultSettings);
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    const scheduleDocRef = doc(db, `users/${userId}/schedules`, scheduleDocId);

    const unsubscribe = onSnapshot(scheduleDocRef, async (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            const scheduleData: WeeklyScheduleItem[] = dayOrder.map(day => ({
                day: day,
                lessons: data[day] || [],
            }));
            setScheduleState(scheduleData);

            const scheduleSettings: ScheduleSettings = {
                timeSlots: data.timeSlots || defaultSettings.timeSlots,
                lessonDuration: data.lessonDuration || defaultSettings.lessonDuration,
            };
            setSettings(scheduleSettings);
        } else {
            const defaultScheduleData = dayOrder.reduce((acc, day) => {
                acc[day] = [];
                return acc;
            }, {} as { [key in Day]: Lesson[] });

            const initialData = { ...defaultScheduleData, ...defaultSettings };

             try {
                await setDoc(scheduleDocRef, initialData);
                setScheduleState(getDefaultSchedule());
                setSettings(defaultSettings);
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


  const updateLesson = async (day: Day, lesson: Lesson | null, lessonSlot: number) => {
    if (!userId) return;

    const scheduleDocRef = doc(db, `users/${userId}/schedules`, scheduleDocId);

    try {
        const docSnap = await getDoc(scheduleDocRef);
        const currentData = docSnap.exists() ? docSnap.data() : {};
        const dayLessons: Lesson[] = currentData[day] || [];
        
        let updatedLessons: Lesson[];

        const existingIndex = dayLessons.findIndex(l => l.lessonSlot === lessonSlot);

        if (lesson) {
             if (existingIndex > -1) {
                updatedLessons = [...dayLessons];
                updatedLessons[existingIndex] = lesson;
             } else {
                updatedLessons = [...dayLessons, lesson];
             }
        } else {
            if (existingIndex > -1) {
                 updatedLessons = dayLessons.filter(l => l.lessonSlot !== lessonSlot);
            } else {
                // Nothing to remove
                return;
            }
        }

        await updateDoc(scheduleDocRef, {
            [day]: updatedLessons
        });
    } catch (error) {
         console.error("Error updating lesson:", error);
         toast({
            title: "Hata!",
            description: "Ders güncellenirken bir hata oluştu.",
            variant: "destructive"
        });
    }
  };

  const updateSettings = async (newSettings: Partial<ScheduleSettings>) => {
    if (!userId) return;
    const scheduleDocRef = doc(db, `users/${userId}/schedules`, scheduleDocId);
    try {
        await updateDoc(scheduleDocRef, newSettings);
    } catch (error) {
         console.error("Error updating settings:", error);
         toast({
            title: "Hata!",
            description: "Ayarlar güncellenirken bir hata oluştu.",
            variant: "destructive"
        });
    }
  };

  const setSchedule = async (newSchedule: WeeklyScheduleItem[]) => {
    if (!userId) return;
    const scheduleDocRef = doc(db, `users/${userId}/schedules`, scheduleDocId);
    try {
        const scheduleDataForDb = newSchedule.reduce((acc, daySchedule) => {
            acc[daySchedule.day] = daySchedule.lessons;
            return acc;
        }, {} as { [key: string]: Lesson[] });
        
        await updateDoc(scheduleDocRef, scheduleDataForDb);
    } catch (error) {
        console.error("Error setting new schedule:", error);
        toast({
            title: "Hata!",
            description: "Ders programı aktarılırken bir hata oluştu.",
            variant: "destructive"
        });
    }
  };
  
  return { schedule, settings, isLoading, updateLesson, updateSettings, setSchedule };
}
