
import type { ClassInfo, DailyRecord, Lesson, Note, Plan, Student, WeeklyScheduleItem } from './types';

export const classes: (ClassInfo & { students: Student[] })[] = [
    { 
        id: '6A', 
        name: '6/A',
        students: [
            { id: '6A-1', studentNumber: 101, firstName: 'Zeynep', lastName: 'Demir', classId: '6A' },
            { id: '6A-2', studentNumber: 102, firstName: 'Emir', lastName: 'Çelik', classId: '6A' },
            { id: '6A-3', studentNumber: 103, firstName: 'Elif', lastName: 'Şahin', classId: '6A' },
            { id: '6A-4', studentNumber: 104, firstName: 'Yusuf', lastName: 'Turan', classId: '6A' },
        ]
    },
    { 
        id: '7B', 
        name: '7/B',
        students: [
            { id: '7B-1', studentNumber: 201, firstName: 'Hiranur', lastName: 'Aydın', classId: '7B' },
            { id: '7B-2', studentNumber: 202, firstName: 'Ömer Asaf', lastName: 'Öztürk', classId: '7B' },
            { id: '7B-3', studentNumber: 203, firstName: 'Ecrin', lastName: 'Kılıç', classId: '7B' },
        ]
    },
];

export const students: Student[] = classes.flatMap(c => c.students);

export const dailyRecords: DailyRecord[] = [
    { id: 'rec-1', studentId: '6A-1', classId: '6A', date: '2024-05-20', status: '+', description: 'Derse aktif katıldı.' },
    { id: 'rec-2', studentId: '6A-2', classId: '6A', date: '2024-05-20', status: 'P', description: 'Ödevini yarım yapmış.' },
    { id: 'rec-3', studentId: '6A-3', classId: '6A', date: '2024-05-20', status: '-', description: 'Arkadaşıyla konuştu.' },
    { id: 'rec-4', studentId: '7B-1', classId: '7B', date: '2024-05-20', status: 'Y', description: '' },
];


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
