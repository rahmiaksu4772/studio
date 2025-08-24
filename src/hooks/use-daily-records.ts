
'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import type { DailyRecord, Student, ClassInfo, RecordEvent, RecordEventType, RecordEventValue } from '@/lib/types';
import { dailyRecords as initialRecords } from '@/lib/mock-data';

const RECORDS_STORAGE_KEY = 'daily-records';
const CLASSES_STORAGE_KEY = 'classes-and-students';

// Type for the stored data
type ClassWithStudents = ClassInfo & {
    students: Student[];
};

export function useDailyRecords() {
  const { toast } = useToast();
  const [records, setRecords] = React.useState<DailyRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    try {
      const savedRecords = localStorage.getItem(RECORDS_STORAGE_KEY);
      if (savedRecords) {
        // Data migration: check if old format exists
        const parsed = JSON.parse(savedRecords);
        if (parsed.length > 0 && 'status' in parsed[0]) {
           // This is the old format, migrate it
           const migrated = migrateV1ToV2(parsed);
           setRecords(migrated);
           localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(migrated));
        } else {
           setRecords(parsed);
        }
      } else {
        // Load initial mock data if nothing is in localStorage, and migrate it
        const migrated = migrateV1ToV2(initialRecords);
        setRecords(migrated);
        localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(migrated));
      }
    } catch (error) {
      console.error("Failed to load/migrate records from localStorage", error);
      toast({
        title: "Kayıtlar Yüklenemedi",
        description: "Günlük kayıtlarınız yüklenirken bir sorun oluştu.",
        variant: "destructive"
      });
      setRecords([]); 
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const migrateV1ToV2 = (oldRecords: any[]): DailyRecord[] => {
    const newRecords: Record<string, DailyRecord> = {};
    oldRecords.forEach(old => {
        const key = `${old.classId}-${old.date}-${old.studentId}`;
        if (!newRecords[key]) {
            newRecords[key] = {
                id: key,
                classId: old.classId,
                date: old.date,
                studentId: old.studentId,
                events: []
            };
        }
        if (old.status) {
            newRecords[key].events.push({
                id: `${key}-status-${newRecords[key].events.length}`,
                type: 'status',
                value: old.status,
            });
        }
        if (old.description) {
            newRecords[key].events.push({
                id: `${key}-note-${newRecords[key].events.length}`,
                type: 'note',
                value: old.description,
            });
        }
    });
    return Object.values(newRecords);
  }

  const updateLocalStorage = (updatedRecords: DailyRecord[]) => {
    try {
      localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(updatedRecords));
      setRecords(updatedRecords);
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
  
  const addEvent = React.useCallback((classId: string, studentId: string, date: string, event: { type: RecordEventType, value: RecordEventValue }) => {
    setRecords(prevRecords => {
        const recordId = `${classId}-${date}-${studentId}`;
        const newEvent: RecordEvent = {
            id: new Date().toISOString(),
            ...event
        };
        
        const existingRecordIndex = prevRecords.findIndex(r => r.id === recordId);
        
        let newRecords = [...prevRecords];

        if (existingRecordIndex > -1) {
            newRecords[existingRecordIndex] = {
                ...newRecords[existingRecordIndex],
                events: [...newRecords[existingRecordIndex].events, newEvent]
            };
        } else {
            newRecords.push({
                id: recordId,
                classId,
                studentId,
                date,
                events: [newEvent]
            });
        }
        
        updateLocalStorage(newRecords);
        return newRecords;
    });
  }, []);

  const addBulkEvents = React.useCallback((classId: string, studentIds: string[], date: string, event: { type: RecordEventType, value: RecordEventValue }) => {
    setRecords(prevRecords => {
      let newRecords = [...prevRecords];
      
      studentIds.forEach(studentId => {
        const recordId = `${classId}-${date}-${studentId}`;
        const newEvent: RecordEvent = {
            id: new Date().toISOString() + `-${studentId}`, // Ensure unique ID in bulk add
            ...event
        };
        
        const existingRecordIndex = newRecords.findIndex(r => r.id === recordId);

        if (existingRecordIndex > -1) {
            newRecords[existingRecordIndex] = {
                ...newRecords[existingRecordIndex],
                events: [...newRecords[existingRecordIndex].events, newEvent]
            };
        } else {
            newRecords.push({
                id: recordId,
                classId,
                studentId,
                date,
                events: [newEvent]
            });
        }
      });
        
      updateLocalStorage(newRecords);
      return newRecords;
    });
  }, []);

  const removeEvent = React.useCallback((classId: string, studentId: string, date: string, eventId: string) => {
    setRecords(prevRecords => {
      const recordId = `${classId}-${date}-${studentId}`;
      const existingRecordIndex = prevRecords.findIndex(r => r.id === recordId);

      if (existingRecordIndex === -1) return prevRecords;

      let newRecords = [...prevRecords];
      const updatedEvents = newRecords[existingRecordIndex].events.filter(e => e.id !== eventId);
      
      newRecords[existingRecordIndex] = {
        ...newRecords[existingRecordIndex],
        events: updatedEvents
      };

      // If no events are left, we can either keep the record with empty events or remove it.
      // Let's keep it for simplicity, as it doesn't harm.

      updateLocalStorage(newRecords);
      return newRecords;
    });
  }, []);

  const deleteRecordsForClass = (classId: string) => {
    setRecords(prevRecords => {
      const remainingRecords = prevRecords.filter(r => r.classId !== classId);
      updateLocalStorage(remainingRecords);
      return remainingRecords;
    });
  };
  
  const deleteRecordsForStudent = (classId: string, studentId: string) => {
     setRecords(prevRecords => {
      const remainingRecords = prevRecords.filter(r => !(r.classId === classId && r.studentId === studentId));
      updateLocalStorage(remainingRecords);
      return remainingRecords;
    });
  }

  return { records, isLoading, getRecordsForDate, addEvent, addBulkEvents, removeEvent, deleteRecordsForClass, deleteRecordsForStudent };
}


export function useClassesAndStudents() {
    const { toast } = useToast();
    const { deleteRecordsForClass, deleteRecordsForStudent } = useDailyRecords();
    const [classes, setClasses] = React.useState<ClassWithStudents[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
      setIsLoading(true);
      try {
        const savedData = localStorage.getItem(CLASSES_STORAGE_KEY);
        if (savedData) {
          setClasses(JSON.parse(savedData));
        } else {
           const defaultClasses: ClassWithStudents[] = [
                { id: '6A', name: '6/A', students: [
                    { id: '6A-1', studentNumber: 101, firstName: 'Zeynep', lastName: 'Demir', classId: '6A' },
                    { id: '6A-2', studentNumber: 102, firstName: 'Emir', lastName: 'Çelik', classId: '6A' },
                ]},
                { id: '7B', name: '7/B', students: [
                     { id: '7B-1', studentNumber: 201, firstName: 'Hiranur', lastName: 'Aydın', classId: '7B' },
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
        if (classes.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            throw new Error(`"${name}" adında bir sınıf zaten mevcut.`);
        }
        const newClass: ClassWithStudents = {
            id: new Date().toISOString(),
            name,
            students: []
        };
        updateStorage([...classes, newClass]);
    };
    
    const updateClass = (classId: string, newName: string) => {
        if (classes.some(c => c.id !== classId && c.name.toLowerCase() === newName.toLowerCase())) {
             throw new Error(`"${newName}" adında bir sınıf zaten mevcut.`);
        }
        const updatedClasses = classes.map(c => 
            c.id === classId ? { ...c, name: newName } : c
        );
        updateStorage(updatedClasses);
    };

    const deleteClass = (classId: string) => {
        const updatedClasses = classes.filter(c => c.id !== classId);
        updateStorage(updatedClasses);
        // Also delete all associated daily records
        deleteRecordsForClass(classId);
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
        deleteRecordsForStudent(classId, studentId);
    };

    return { classes, isLoading, addClass, updateClass, deleteClass, addStudent, addMultipleStudents, updateStudent, deleteStudent };
}

    