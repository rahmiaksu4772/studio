
'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import type { DailyRecord } from '@/lib/types';
import { dailyRecords as initialRecords } from '@/lib/mock-data';

const RECORDS_STORAGE_KEY = 'daily-records';

export function useDailyRecords() {
  const { toast } = useToast();
  const [records, setRecords] = React.useState<DailyRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    try {
      const savedRecords = localStorage.getItem(RECORDS_STORAGE_KEY);
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords));
      } else {
        // Load initial mock data if nothing is in localStorage
        setRecords(initialRecords);
      }
    } catch (error) {
      console.error("Failed to load records from localStorage", error);
      toast({
        title: "Kayıtlar Yüklenemedi",
        description: "Günlük kayıtlarınız yüklenirken bir sorun oluştu.",
        variant: "destructive"
      });
      setRecords(initialRecords); // Fallback to mock data on error
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateLocalStorage = (updatedRecords: DailyRecord[]) => {
    try {
      localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(updatedRecords));
    } catch (error) {
      console.error("Failed to save records to localStorage", error);
      toast({
        title: "Kayıtlar Kaydedilemedi",
        description: "Değişiklikleriniz kaydedilirken bir sorun oluştu.",
        variant: "destructive"
      });
    }
  };

  const getRecordsForDate = React.useCallback((classId: string, date: string): DailyRecord[] => {
    return records.filter(record => record.classId === classId && record.date === date);
  }, [records]);

  const updateDailyRecords = React.useCallback((classId: string, date: string, newRecords: Omit<DailyRecord, 'id'>[]) => {
      setRecords(prevRecords => {
          // Create a map of the new records for quick lookup
          const newRecordsMap = new Map(newRecords.map(r => [r.studentId, r]));

          // Get all records EXCEPT for the current class and date
          const otherRecords = prevRecords.filter(r => r.classId !== classId || r.date !== date);

          // Get the existing records for the current class and date
          const existingRecordsForDate = prevRecords.filter(r => r.classId === classId && r.date === date);
          
          // Create a set of student IDs that have new records
          const updatedStudentIds = new Set(newRecords.map(r => r.studentId));

          // Update existing records if they are in the new batch, otherwise keep them
          const updatedOrKeptRecords = existingRecordsForDate.map(existingRecord => {
              if (newRecordsMap.has(existingRecord.studentId)) {
                  // This student's record is being updated. Use the new one.
                  const newRecord = newRecordsMap.get(existingRecord.studentId)!;
                  return { ...existingRecord, ...newRecord };
              }
              // This student's record was not in the new batch, so keep the old one.
              return existingRecord;
          });

          // Add brand new records (for students who didn't have a record for this date before)
          const brandNewRecords = newRecords
              .filter(nr => !existingRecordsForDate.some(er => er.studentId === nr.studentId))
              .map(nr => ({ ...nr, id: `${nr.studentId}-${nr.date}` }));
          
          const finalRecordsForDate = [...updatedOrKeptRecords, ...brandNewRecords];

          const allRecords = [...otherRecords, ...finalRecordsForDate];
          updateLocalStorage(allRecords);
          return allRecords;
      });
  }, []);

  return { records, isLoading, getRecordsForDate, updateDailyRecords };
}

// A new hook to manage classes and students from localStorage
const CLASSES_STORAGE_KEY = 'classes-and-students';

// Type for the stored data
type ClassWithStudents = {
    id: string;
    name: string;
    students: Student[];
};

export function useClassesAndStudents() {
    const { toast } = useToast();
    const [classes, setClasses] = React.useState<ClassWithStudents[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
      setIsLoading(true);
      try {
        const savedData = localStorage.getItem(CLASSES_STORAGE_KEY);
        if (savedData) {
          setClasses(JSON.parse(savedData));
        } else {
           // Provide some default data if nothing is in storage
           const defaultClasses = [
                { id: '1A', name: '1/A', students: [
                    { id: '1A-1', studentNumber: 1, firstName: 'Ahmet', lastName: 'Yılmaz', classId: '1A' },
                    { id: '1A-2', studentNumber: 2, firstName: 'Ayşe', lastName: 'Kaya', classId: '1A' },
                ]},
                { id: '2B', name: '2/B', students: [
                     { id: '2B-1', studentNumber: 1, firstName: 'Mehmet', lastName: 'Demir', classId: '2B' },
                ]}
           ];
           setClasses(defaultClasses);
           localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(defaultClasses));
        }
      } catch (error) {
        console.error("Failed to load classes from localStorage", error);
        toast({ title: "Hata", description: "Sınıf verileri yüklenemedi.", variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }, [toast]);

    const updateStorage = (updatedClasses: ClassWithStudents[]) => {
        try {
            localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(updatedClasses));
            setClasses(updatedClasses);
        } catch(error) {
             toast({ title: "Hata", description: "Değişiklikler kaydedilemedi.", variant: 'destructive' });
        }
    }

    const addClass = (name: string) => {
        const newClass: ClassWithStudents = {
            id: new Date().toISOString(),
            name,
            students: []
        };
        if (classes.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            throw new Error(`"${name}" adında bir sınıf zaten mevcut.`);
        }
        updateStorage([...classes, newClass]);
    };
    
    const addStudent = (classId: string, studentData: Omit<Student, 'id'|'classId'>) => {
        const newStudent: Student = {
            ...studentData,
            id: new Date().toISOString(),
            classId,
        };
        const updatedClasses = classes.map(c => {
            if (c.id === classId) {
                if (c.students.some(s => s.studentNumber === newStudent.studentNumber)) {
                    throw new Error(`Bu numaraya sahip bir öğrenci zaten mevcut.`);
                }
                return { ...c, students: [...c.students, newStudent]};
            }
            return c;
        });
        updateStorage(updatedClasses);
    };

    const addMultipleStudents = (classId: string, newStudents: Omit<Student, 'id'|'classId'>[]) => {
         const updatedClasses = classes.map(c => {
            if (c.id === classId) {
                const existingNumbers = new Set(c.students.map(s => s.studentNumber));
                const studentsToAdd = newStudents
                    .filter(ns => !existingNumbers.has(ns.studentNumber))
                    .map(ns => ({ ...ns, id: `${classId}-${ns.studentNumber}-${Math.random()}`, classId}));
                
                if (studentsToAdd.length < newStudents.length) {
                    toast({title: "Uyarı", description: "Mevcut listede olan bazı öğrenci numaraları atlandı."});
                }
                
                return { ...c, students: [...c.students, ...studentsToAdd]};
            }
            return c;
        });
        updateStorage(updatedClasses);
    };

    const updateStudent = (classId: string, updatedStudent: Student) => {
         const updatedClasses = classes.map(c => {
            if (c.id === classId) {
                 if (c.students.some(s => s.studentNumber === updatedStudent.studentNumber && s.id !== updatedStudent.id)) {
                    throw new Error(`Bu numaraya sahip bir öğrenci zaten mevcut.`);
                }
                const newStudents = c.students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
                return { ...c, students: newStudents };
            }
            return c;
        });
        updateStorage(updatedClasses);
    };

    const deleteStudent = (classId: string, studentId: string) => {
        const updatedClasses = classes.map(c => {
            if (c.id === classId) {
                return { ...c, students: c.students.filter(s => s.id !== studentId) };
            }
            return c;
        });
        updateStorage(updatedClasses);
    };

    return { classes, isLoading, addClass, addStudent, addMultipleStudents, updateStudent, deleteStudent };
}
