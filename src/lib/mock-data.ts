

import type { Student, ClassInfo, DailyRecord, WeeklyScheduleItem } from './types';

export const classes: ClassInfo[] = [
  { id: 'c1', name: '6/A' },
  { id: 'c2', name: '7/B' },
];

export const students: Student[] = [
  // 6/A
  { id: 's1', studentNumber: 123, firstName: 'Ahmet', lastName: 'Yılmaz', classId: 'c1' },
  { id: 's2', studentNumber: 124, firstName: 'Ayşe', lastName: 'Kaya', classId: 'c1' },
  { id: 's3', studentNumber: 125, firstName: 'Mehmet', lastName: 'Demir', classId: 'c1' },
  { id: 's4', studentNumber: 126, firstName: 'Zeynep', lastName: 'Özkan', classId: 'c1' },
  { id: 's5', studentNumber: 127, firstName: 'Can', lastName: 'Arslan', classId: 'c1' },
  { id: 's6', studentNumber: 128, firstName: 'Elif', lastName: 'Doğan', classId: 'c1' },
  { id: 's7', studentNumber: 129, firstName: 'Mustafa', lastName: 'Şahin', classId: 'c1' },
  { id: 's8', studentNumber: 130, firstName: 'Selin', lastName: 'Çelik', classId: 'c1' },
  
  // 7/B
  { id: 's9', studentNumber: 201, firstName: 'Emre', lastName: 'Koç', classId: 'c2' },
  { id: 's10', studentNumber: 202, firstName: 'Fatma', lastName: 'Yıldız', classId: 'c2' },
  { id: 's11', studentNumber: 203, firstName: 'Ali', lastName: 'Öztürk', classId: 'c2' },
  { id: 's12', studentNumber: 204, firstName: 'Merve', lastName: 'Aydın', classId: 'c2' },
];

// Initial daily records are now an empty array.
// Data will be populated and managed via localStorage in the useDailyRecords hook.
export const dailyRecords: DailyRecord[] = [];


export type Lesson = {
  time: string;
  subject: string;
  class: string;
}

export interface WeeklyScheduleItem {
  day: string;
  lessons: Lesson[];
  color: string;
}

export const weeklySchedule: WeeklyScheduleItem[] = [
  {
    day: 'Pazartesi',
    color: 'bg-red-100 dark:bg-red-900/40 hover:bg-red-200/80',
    lessons: [
      { time: '09:00 - 09:40', subject: 'Matematik', class: '6/A' },
      { time: '09:50 - 10:30', subject: 'Matematik', class: '6/A' },
      { time: '10:40 - 11:20', subject: 'Sosyal Bilgiler', class: '6/A' },
      { time: '11:30 - 12:10', subject: 'Fen Bilimleri', class: '7/B' },
      { time: '13:10 - 13:50', subject: 'Matematik', class: '7/B' },
      { time: '14:00 - 14:40', subject: 'Matematik', class: '7/B' },
    ],
  },
  {
    day: 'Salı',
    color: 'bg-orange-100 dark:bg-orange-900/40 hover:bg-orange-200/80',
    lessons: [
      { time: '09:00 - 09:40', subject: 'Türkçe', class: '6/A' },
      { time: '09:50 - 10:30', subject: 'İngilizce', class: '6/A' },
      { time: '10:40 - 11:20', subject: 'Matematik', class: '6/A' },
      { time: '11:30 - 12:10', subject: 'Matematik', class: '6/A' },
      { time: '13:10 - 13:50', subject: 'Türkçe', class: '7/B' },
      { time: '14:00 - 14:40', subject: 'Fen Bilimleri', class: '7/B' },
    ],
  },
  {
    day: 'Çarşamba',
    color: 'bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200/80',
    lessons: [
      { time: '09:00 - 09:40', subject: 'Matematik', class: '7/B' },
      { time: '09:50 - 10:30', subject: 'Matematik', class: '7/B' },
      { time: '10:40 - 11:20', subject: 'Beden Eğitimi', class: '6/A' },
      { time: '11:30 - 12:10', subject: 'Beden Eğitimi', class: '6/A' },
      { time: '13:10 - 13:50', subject: 'Matematik', class: '6/A' },
    ],
  },
  {
    day: 'Perşembe',
    color: 'bg-yellow-100 dark:bg-yellow-900/40 hover:bg-yellow-200/80',
    lessons: [
       { time: '09:50 - 10:30', subject: 'Fen Bilimleri', class: '6/A' },
       { time: '10:40 - 11:20', subject: 'Fen Bilimleri', class: '6/A' },
       { time: '11:30 - 12:10', subject: 'Matematik', class: '7/B' },
       { time: '13:10 - 13:50', subject: 'Sosyal Bilgiler', class: '7/B' },
       { time: '14:00 - 14:40', subject: 'İngilizce', class: '7/B' },
    ],
  },
  {
    day: 'Cuma',
    color: 'bg-lime-100 dark:bg-lime-900/40 hover:bg-lime-200/80',
    lessons: [
       { time: '09:00 - 09:40', subject: 'Matematik', class: '6/A' },
       { time: '09:50 - 10:30', subject: 'Görsel Sanatlar', class: '7/B' },
       { time: '10:40 - 11:20', subject: 'Matematik', class: '7/B' },
       { time: '11:30 - 12:10', subject: 'Müzik', class: '6/A' },
    ],
  },
  {
    day: 'Cumartesi',
    color: 'bg-teal-100 dark:bg-teal-900/40 hover:bg-teal-200/80',
    lessons: [],
  },
  {
    day: 'Pazar',
    color: 'bg-sky-100 dark:bg-sky-900/40 hover:bg-sky-200/80',
    lessons: [],
  },
];

    