
'use server';

import { db } from '@/lib/firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where,
    writeBatch,
    getDoc,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';

import type { Student, ClassInfo, DailyRecord, Note, Plan } from '@/lib/types';


// Currently, we assume a single user (teacher). 
// In a multi-user app, you'd pass a userId to all these functions.
const TEACHER_ID = "default-teacher"; 

// --- Class (Sınıf) Operations ---

export async function addClass(className: string): Promise<ClassInfo> {
    const docRef = await addDoc(collection(db, `teachers/${TEACHER_ID}/classes`), {
        name: className,
        createdAt: serverTimestamp()
    });
    return { id: docRef.id, name: className };
}

export async function getClasses(): Promise<ClassInfo[]> {
    const q = query(collection(db, `teachers/${TEACHER_ID}/classes`), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassInfo));
}

// --- Student (Öğrenci) Operations ---

export async function addStudent(classId: string, studentData: Omit<Student, 'id' | 'classId'>): Promise<Student> {
    const docRef = await addDoc(collection(db, `teachers/${TEACHER_ID}/classes/${classId}/students`), {
        ...studentData
    });
    return { ...studentData, id: docRef.id, classId };
}

export async function addMultipleStudents(classId: string, students: Omit<Student, 'id' | 'classId'>[]): Promise<void> {
    const batch = writeBatch(db);
    const studentsCollection = collection(db, `teachers/${TEACHER_ID}/classes/${classId}/students`);
    students.forEach(student => {
        const docRef = doc(studentsCollection);
        batch.set(docRef, student);
    });
    await batch.commit();
}

export async function getStudents(classId: string): Promise<Student[]> {
    const studentsCollection = collection(db, `teachers/${TEACHER_ID}/classes/${classId}/students`);
    const q = query(studentsCollection, orderBy("studentNumber", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, classId, ...doc.data() } as Student));
}

export async function updateStudent(classId: string, student: Student): Promise<void> {
    const studentRef = doc(db, `teachers/${TEACHER_ID}/classes/${classId}/students`, student.id);
    await updateDoc(studentRef, {
        firstName: student.firstName,
        lastName: student.lastName,
        studentNumber: student.studentNumber
    });
}

export async function deleteStudent(classId: string, studentId: string): Promise<void> {
    await deleteDoc(doc(db, `teachers/${TEACHER_ID}/classes/${classId}/students`, studentId));
}

// --- Daily Record (Günlük Takip) Operations ---

export async function getDailyRecords(classId: string, date: string): Promise<DailyRecord[]> {
    const recordsCollection = collection(db, `teachers/${TEACHER_ID}/dailyRecords`);
    const q = query(recordsCollection, where("classId", "==", classId), where("date", "==", date));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyRecord));
}

export async function saveDailyRecords(recordsToSave: Omit<DailyRecord, 'id'>[]): Promise<void> {
    const batch = writeBatch(db);
    const recordsCollection = collection(db, `teachers/${TEACHER_ID}/dailyRecords`);

    for (const recordData of recordsToSave) {
        // Query to see if a record for this student on this date already exists
        const q = query(recordsCollection, 
            where("studentId", "==", recordData.studentId), 
            where("date", "==", recordData.date)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // If no record exists, create a new one
            const newDocRef = doc(recordsCollection);
            batch.set(newDocRef, recordData);
        } else {
            // If a record exists, update it
            const existingDocRef = querySnapshot.docs[0].ref;
            batch.update(existingDocRef, recordData);
        }
    }
    
    await batch.commit();
}

export async function getRecordsForReport(classId: string, startDate: string, endDate: string): Promise<DailyRecord[]> {
    const recordsCollection = collection(db, `teachers/${TEACHER_ID}/dailyRecords`);
    const q = query(recordsCollection, 
        where("classId", "==", classId),
        where("date", ">=", startDate),
        where("date", "<=", endDate)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyRecord));
}


// --- Notes (Notlarim) Operations ---

export async function addNote(noteData: Omit<Note, 'id'|'date'>): Promise<Note> {
    const docRef = await addDoc(collection(db, `teachers/${TEACHER_ID}/notes`), {
        ...noteData,
        date: format(new Date(), 'dd.MM.yyyy')
    });
    return { ...noteData, id: docRef.id, date: format(new Date(), 'dd.MM.yyyy') };
}

export async function getNotes(): Promise<Note[]> {
    const notesCollection = collection(db, `teachers/${TEACHER_ID}/notes`);
    const q = query(notesCollection, orderBy("date", "desc")); // Assuming you want latest first
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
}

export async function deleteNote(noteId: string): Promise<void> {
    await deleteDoc(doc(db, `teachers/${TEACHER_ID}/notes`, noteId));
}

// --- Plans (Planlarim) Operations ---
import { format } from 'date-fns';

export async function addPlan(planData: Omit<Plan, 'id' | 'uploadDate'>): Promise<Plan> {
    const uploadDate = format(new Date(), 'dd.MM.yyyy');
    const docRef = await addDoc(collection(db, `teachers/${TEACHER_ID}/plans`), {
        ...planData,
        uploadDate: uploadDate
    });
    return { ...planData, id: docRef.id, uploadDate };
}

export async function getPlans(): Promise<Plan[]> {
    const plansCollection = collection(db, `teachers/${TEACHER_ID}/plans`);
    // Assuming you don't have a timestamp, sorting by a field is needed for consistent order.
    // If you add a `createdAt` timestamp field, you can order by that.
    const querySnapshot = await getDocs(plansCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan));
}

export async function deletePlan(planId: string): Promise<void> {
    await deleteDoc(doc(db, `teachers/${TEACHER_ID}/plans`, planId));
}
