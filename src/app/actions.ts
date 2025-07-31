'use server';

import { descriptionAutoFill } from '@/ai/flows/description-auto-fill';
import type { DescriptionAutoFillInput } from '@/ai/flows/description-auto-fill';
import { db } from '@/lib/firebase';
import type { ClassInfo, DailyRecord, Note, Plan, Student } from '@/lib/types';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';

const TEACHER_ID = "default-teacher";

export async function generateDescriptionAction(input: DescriptionAutoFillInput) {
  try {
    const result = await descriptionAutoFill(input);

    if (result?.description) {
      return { description: result.description };
    }
    
    return { description: "AI-powered description could not be generated." };

  } catch (error) {
    console.error('AI description generation failed:', error);
    return { error: 'AI ile açıklama üretilirken bir hata oluştu.' };
  }
}

// --- Data Fetching Actions ---

export async function getClassesAction(): Promise<ClassInfo[]> {
    const q = query(collection(db, `teachers/${TEACHER_ID}/classes`), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassInfo));
}

export async function getStudentsAction(classId: string): Promise<Student[]> {
    if (!classId) return [];
    const studentsCollection = collection(db, `teachers/${TEACHER_ID}/classes/${classId}/students`);
    const q = query(studentsCollection, orderBy("studentNumber", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, classId, ...doc.data() } as Student));
}

export async function getDailyRecordsAction(classId: string, date: string): Promise<DailyRecord[]> {
    if (!classId || !date) return [];
    const recordsCollection = collection(db, `teachers/${TEACHER_ID}/dailyRecords`);
    const q = query(recordsCollection, where("classId", "==", classId), where("date", "==", date));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyRecord));
}

export async function getRecordsForReportAction(classId: string, startDate: string, endDate: string): Promise<DailyRecord[]> {
    if (!classId || !startDate || !endDate) return [];
    const recordsCollection = collection(db, `teachers/${TEACHER_ID}/dailyRecords`);
    const q = query(recordsCollection, 
        where("classId", "==", classId),
        where("date", ">=", startDate),
        where("date", "<=", endDate)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyRecord));
}

export async function getNotesAction(): Promise<Note[]> {
    const notesCollection = collection(db, `teachers/${TEACHER_ID}/notes`);
    const q = query(notesCollection, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
}

export async function getPlansAction(): Promise<Plan[]> {
    const plansCollection = collection(db, `teachers/${TEACHER_ID}/plans`);
    const querySnapshot = await getDocs(plansCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan));
}
