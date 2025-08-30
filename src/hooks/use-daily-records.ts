
'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import type { DailyRecord, Student, ClassInfo } from '@/lib/types';
import { db } from '@/lib/firebase';
import { 
    collection, onSnapshot, doc, getDocs, writeBatch, deleteDoc, addDoc, updateDoc, query
} from 'firebase/firestore';


export function useDailyRecords(classId?: string) {
  const { toast } = useToast();
  const [records, setRecords] = React.useState<DailyRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    if (!classId) {
        setRecords([]);
        setIsLoading(false);
        return;
    };

    setIsLoading(true);
    const recordsQuery = query(collection(db, `classes/${classId}/records`));

    const unsubscribe = onSnapshot(recordsQuery, (querySnapshot) => {
        const recordsData: DailyRecord[] = [];
        querySnapshot.forEach((doc) => {
            recordsData.push({ id: doc.id, ...doc.data() } as DailyRecord);
        });
        setRecords(recordsData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching records:", error);
        toast({
            title: "Kayıtlar Yüklenemedi",
            description: "Günlük kayıtlar yüklenirken bir sorun oluştu.",
            variant: "destructive"
        });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [classId, toast]);


  const bulkUpdateRecords = async (classId: string, date: string, updatedDayRecords: DailyRecord[]) => {
    const batch = writeBatch(db);

    updatedDayRecords.forEach(record => {
        // Firestore'da 'id' alanı dokümanın içinde saklanmaz, bu yüzden onu ayırıyoruz.
        const { id, ...recordData } = record;
        const docRef = doc(db, `classes/${classId}/records`, id);
        batch.set(docRef, recordData, { merge: true }); // merge:true ile var olan dokümanları günceller, yoksa oluşturur.
    });

    try {
        await batch.commit();
    } catch (error) {
        console.error("Error bulk updating records:", error);
        toast({
            title: "Kayıtlar Kaydedilemedi",
            description: "Değişiklikleriniz kaydedilirken bir sorun oluştu.",
            variant: "destructive"
        });
    }
  };

  return { records, isLoading, bulkUpdateRecords };
}


export function useClassesAndStudents() {
    const { toast } = useToast();
    const [classes, setClasses] = React.useState<ClassInfo[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        setIsLoading(true);
        const q = query(collection(db, "classes"));
        
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const classesData: ClassInfo[] = [];
            for (const classDoc of querySnapshot.docs) {
                const classData = { id: classDoc.id, ...classDoc.data() } as ClassInfo
                
                const studentsSnapshot = await getDocs(collection(db, `classes/${classDoc.id}/students`));
                classData.students = studentsSnapshot.docs.map(studentDoc => ({
                    id: studentDoc.id,
                    ...studentDoc.data()
                } as Student));
                
                classesData.push(classData);
            }
            setClasses(classesData);
            setIsLoading(false);
        }, (error) => {
            console.error("Failed to load classes from Firestore", error);
            toast({ title: "Hata", description: "Sınıf verileri yüklenemedi.", variant: 'destructive' });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);
    
    const addClass = async (name: string) => {
        if (classes.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            throw new Error(`"${name}" adında bir sınıf zaten mevcut.`);
        }
        await addDoc(collection(db, "classes"), { name });
    };
    
    const updateClass = async (classId: string, newName: string) => {
        if (classes.some(c => c.id !== classId && c.name.toLowerCase() === newName.toLowerCase())) {
             throw new Error(`"${newName}" adında bir sınıf zaten mevcut.`);
        }
        const classRef = doc(db, "classes", classId);
        await updateDoc(classRef, { name: newName });
    };

    const deleteClass = async (classId: string) => {
        const batch = writeBatch(db);
        const classRef = doc(db, "classes", classId);
        
        // Delete all students in the class
        const studentsSnapshot = await getDocs(collection(db, `classes/${classId}/students`));
        studentsSnapshot.forEach(doc => batch.delete(doc.ref));

        // Delete all records for the class
        const recordsSnapshot = await getDocs(collection(db, `classes/${classId}/records`));
        recordsSnapshot.forEach(doc => batch.delete(doc.ref));
        
        batch.delete(classRef);
        
        await batch.commit();
    };
    
    const addStudent = async (classId: string, studentData: Omit<Student, 'id'|'classId'>) => {
        const currentClass = classes.find(c => c.id === classId);
        if (currentClass && currentClass.students.some(s => s.studentNumber === studentData.studentNumber)) {
            throw new Error(`Bu numaraya sahip bir öğrenci zaten mevcut.`);
        }
        await addDoc(collection(db, `classes/${classId}/students`), { ...studentData, classId });
    };

    const addMultipleStudents = async (classId: string, newStudents: Omit<Student, 'id'|'classId'>[]) => {
         const currentClass = classes.find(c => c.id === classId);
         if (!currentClass) return;

         const batch = writeBatch(db);
         const existingNumbers = new Set(currentClass.students.map(s => s.studentNumber));

         const studentsToAdd = newStudents.filter(ns => !existingNumbers.has(ns.studentNumber));
         
         if (studentsToAdd.length < newStudents.length) {
             toast({title: "Uyarı", description: "Mevcut listede olan bazı öğrenci numaraları atlandı."});
         }

         studentsToAdd.forEach(student => {
            const studentRef = doc(collection(db, `classes/${classId}/students`));
            batch.set(studentRef, {...student, classId});
         });

         await batch.commit();
    };

    const updateStudent = async (classId: string, updatedStudent: Student) => {
         const currentClass = classes.find(c => c.id === classId);
         if (currentClass && currentClass.students.some(s => s.studentNumber === updatedStudent.studentNumber && s.id !== updatedStudent.id)) {
            throw new Error(`Bu numaraya sahip bir öğrenci zaten mevcut.`);
         }
         const studentRef = doc(db, `classes/${classId}/students`, updatedStudent.id);
         const { id, ...studentData } = updatedStudent;
         await updateDoc(studentRef, studentData);
    };

    const deleteStudent = async (classId: string, studentId: string) => {
        const studentRef = doc(db, `classes/${classId}/students`, studentId);
        await deleteDoc(studentRef);
        // We might want to delete records for this student too, but for now we'll leave them.
    };

    return { classes, isLoading, addClass, updateClass, deleteClass, addStudent, addMultipleStudents, updateStudent, deleteStudent };
}
