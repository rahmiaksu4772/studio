
'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import type { WeeklyScheduleItem, Lesson, Day } from '@/lib/types';
import { weeklySchedule as initialSchedule } from '@/lib/mock-data';

const SCHEDULE_STORAGE_KEY = 'weekly-schedule';

// Add IDs to initial mock data for consistency
const getInitialDataWithIds = (): WeeklyScheduleItem[] => {
    return initialSchedule.map(dayItem => ({
        ...dayItem,
        lessons: dayItem.lessons.map((lesson, index) => ({
            ...lesson,
            id: `${dayItem.day}-${index}-${new Date().getTime()}`
        }))
    }));
}


export function useWeeklySchedule() {
  const { toast } = useToast();
  const [schedule, setSchedule] = React.useState<WeeklyScheduleItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    try {
      const savedSchedule = localStorage.getItem(SCHEDULE_STORAGE_KEY);
      if (savedSchedule) {
        setSchedule(JSON.parse(savedSchedule));
      } else {
        const initialData = getInitialDataWithIds();
        setSchedule(initialData);
        localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(initialData));
      }
    } catch (error) {
      console.error("Failed to load schedule from localStorage", error);
      toast({
        title: "Program Yüklenemedi",
        description: "Ders programı yüklenirken bir sorun oluştu.",
        variant: "destructive"
      });
      setSchedule([]); 
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateLocalStorage = (updatedSchedule: WeeklyScheduleItem[]) => {
    try {
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(updatedSchedule));
      setSchedule(updatedSchedule);
    } catch (error) {
      console.error("Failed to save schedule to localStorage", error);
      toast({
        title: "Program Kaydedilemedi",
        description: "Değişiklikleriniz kaydedilirken bir sorun oluştu.",
        variant: "destructive"
      });
    }
  };

  const addLesson = (day: Day, lessonData: Omit<Lesson, 'id'>) => {
    const newLesson: Lesson = {
        ...lessonData,
        id: new Date().toISOString(),
    };
    
    const updatedSchedule = schedule.map(dayItem => {
        if (dayItem.day === day) {
            return { ...dayItem, lessons: [...dayItem.lessons, newLesson] };
        }
        return dayItem;
    });

    // If the day doesn't exist in the schedule, create it.
    if (!schedule.some(d => d.day === day)) {
        updatedSchedule.push({ day, lessons: [newLesson] });
    }

    updateLocalStorage(updatedSchedule);
    toast({
        title: "Ders Eklendi!",
        description: `"${lessonData.subject}" dersi ${day} gününe eklendi.`
    });
  };

  const deleteLesson = (day: Day, lessonId: string) => {
     const updatedSchedule = schedule.map(dayItem => {
        if (dayItem.day === day) {
            const lessonToDelete = dayItem.lessons.find(l => l.id === lessonId);
            toast({
                title: "Ders Silindi!",
                description: `"${lessonToDelete?.subject}" dersi programdan kaldırıldı.`,
                variant: 'destructive'
            });
            return { ...dayItem, lessons: dayItem.lessons.filter(l => l.id !== lessonId) };
        }
        return dayItem;
    });
    updateLocalStorage(updatedSchedule);
  };
  

  return { schedule, isLoading, addLesson, deleteLesson };
}
