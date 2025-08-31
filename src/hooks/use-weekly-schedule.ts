
'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import type { WeeklyScheduleItem, Day, Lesson, DaySchedule } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

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
  const scheduleDocId = "weekly-lessons-schedule"; 

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
                const dayLessons: Lesson[] = data[day] || [];
                return {
                    day: day,
                    lessons: dayLessons,
                };
            });
            setScheduleState(scheduleData);
        } else {
             const defaultScheduleData = dayOrder.reduce((acc, day) => {
                acc[day] = [];
                return acc;
            }, {} as { [key in Day]: Lesson[] });

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


  const updateLesson = async (day: Day, lessonSlot: number, lesson: Lesson | null) => {
    if (!userId) return;

    const scheduleDocRef = doc(db, `users/${userId}/schedules`, scheduleDocId);

    try {
        const docSnap = await getDoc(scheduleDocRef);
        const currentData = docSnap.exists() ? docSnap.data() : {};
        const dayLessons: Lesson[] = currentData[day] || [];
        
        let updatedLessons: Lesson[];

        if (lesson) {
             const lessonWithSlot = { ...lesson, lessonSlot };
             const existingIndex = dayLessons.findIndex(l => l.lessonSlot === lessonSlot);
             if (existingIndex > -1) {
                // Update existing lesson for the slot
                updatedLessons = [...dayLessons];
                updatedLessons[existingIndex] = lessonWithSlot;
             } else {
                // Add new lesson for the slot
                updatedLessons = [...dayLessons, lessonWithSlot];
             }
        } else {
            // Remove lesson from the slot
            updatedLessons = dayLessons.filter(l => l.lessonSlot !== lessonSlot);
        }

        await setDoc(scheduleDocRef, {
            ...currentData,
            [day]: updatedLessons
        });
        // No toast here, will be handled in the component for better user feedback
    } catch (error) {
         console.error("Error updating lesson:", error);
         toast({
            title: "Hata!",
            description: "Ders güncellenirken bir hata oluştu.",
            variant: "destructive"
        });
    }
  };
  
  return { schedule, isLoading, updateLesson };
}
