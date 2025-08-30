
'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import type { WeeklyScheduleItem, Lesson, Day } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';


const dayOrder: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export function useWeeklySchedule() {
  const { toast } = useToast();
  const [schedule, setSchedule] = React.useState<WeeklyScheduleItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const scheduleId = "main-schedule"; // We'll use a single document for the schedule

  React.useEffect(() => {
    setIsLoading(true);
    const scheduleDocRef = doc(db, "schedules", scheduleId);

    const unsubscribe = onSnapshot(scheduleDocRef, async (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            const scheduleData: WeeklyScheduleItem[] = dayOrder.map(day => ({
                day,
                lessons: data[day] || []
            }));
            setSchedule(scheduleData);
        } else {
            // Document doesn't exist, create it with a default structure
             const defaultSchedule = dayOrder.reduce((acc, day) => ({ ...acc, [day]: [] }), {});
             try {
                await setDoc(scheduleDocRef, defaultSchedule);
             } catch (error) {
                console.error("Failed to create default schedule", error);
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
  }, [toast]);


  const addLesson = async (day: Day, lessonData: Omit<Lesson, 'id'>) => {
    const newLesson: Lesson = {
        ...lessonData,
        id: new Date().toISOString(),
    };
    
    const scheduleDocRef = doc(db, "schedules", scheduleId);
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
     const daySchedule = schedule.find(d => d.day === day);
     const lessonToDelete = daySchedule?.lessons.find(l => l.id === lessonId);
     
     if (!lessonToDelete) return;

     const scheduleDocRef = doc(db, "schedules", scheduleId);
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
