
'use client';

import * as React from 'react';
import { dailyRecords as initialDailyRecords } from '@/lib/mock-data';
import type { DailyRecord } from '@/lib/types';
import { useToast } from './use-toast';

const STORAGE_KEY = 'daily-records';

// This function runs only once per session if localStorage is empty
const generateInitialMockData = (): DailyRecord[] => {
    // For demonstration, you can add some initial data here if needed
    // For example, for the last few days.
    // But for a clean start, we can return an empty array or the default from mock-data.
    return initialDailyRecords; 
}

export function useDailyRecords() {
    const { toast } = useToast();

    // Initialize state from localStorage or generate initial data
    const [dailyRecords, setDailyRecords] = React.useState<DailyRecord[]>(() => {
        if (typeof window === 'undefined') {
            return [];
        }
        try {
            const savedRecordsJson = localStorage.getItem(STORAGE_KEY);
            if (savedRecordsJson) {
                return JSON.parse(savedRecordsJson);
            }
            // If no records in storage, generate some initial ones and save them
            const initialData = generateInitialMockData();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
            return initialData;
        } catch (error) {
            console.error("Error reading from localStorage", error);
            return [];
        }
    });
    
    // Function to update records for a specific class on a specific date
    const updateDailyRecords = (classId: string, date: string, newRecordsForDate: DailyRecord[]) => {
        
        // Create a map of the new records for efficient lookup
        const newRecordsMap = new Map(newRecordsForDate.map(r => [r.studentId, r]));

        // Filter out the old records for the students that are being updated on the given class and date.
        // Records for other students on the same day, or other days/classes are kept.
        const otherRecords = dailyRecords.filter(r => {
            const isSameDayAndClass = r.classId === classId && r.date === date;
            if (!isSameDayAndClass) {
                return true; // Keep record from other days/classes
            }
            // If it's the same day and class, only keep it if it's NOT in the new update list.
            return !newRecordsMap.has(r.studentId);
        });
        
        // Combine the records that were not touched with the new/updated ones.
        const updatedRecords = [...otherRecords, ...newRecordsForDate];

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
            setDailyRecords(updatedRecords);
        } catch (error) {
            console.error("Error writing to localStorage", error);
            toast({
                title: "Kayıt Hatası",
                description: "Değişiklikler kaydedilirken bir sorun oluştu.",
                variant: "destructive",
            });
        }
    };
    
    return { dailyRecords, updateDailyRecords };
}

    