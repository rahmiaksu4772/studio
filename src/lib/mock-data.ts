
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

export const dailyRecords: any[] = [
    { id: 'rec-1', studentId: '6A-1', classId: '6A', date: '2024-05-20', status: '+', description: 'Derse aktif katıldı.' },
    { id: 'rec-2', studentId: '6A-2', classId: '6A', date: '2024-05-20', status: 'P', description: 'Ödevini yarım yapmış.' },
    { id: 'rec-3', studentId: '6A-3', classId: '6A', date: '2024-05-20', status: '-', description: 'Arkadaşıyla konuştu.' },
    { id: 'rec-4', studentId: '7B-1', classId: '7B', date: '2024-05-20', status: 'Y', description: '' },
];


export const weeklySchedule: WeeklyScheduleItem[] = [
  {
    day: 'Pazartesi',
    lessons: [
      { id: '1', time: '09:00 - 09:40', subject: 'Matematik', class: '6/A' },
      { id: '2', time: '09:50 - 10:30', subject: 'Matematik', class: '6/A' },
      { id: '3', time: '13:10 - 13:50', subject: 'Matematik', class: '7/B' },
    ],
  },
  {
    day: 'Salı',
    lessons: [
      { id: '4', time: '10:40 - 11:20', subject: 'Matematik', class: '6/A' },
    ],
  },
  {
    day: 'Çarşamba',
    lessons: [
       { id: '5', time: '09:00 - 09:40', subject: 'Matematik', class: '7/B' },
       { id: '6', time: '09:50 - 10:30', subject: 'Matematik', class: '7/B' },
    ],
  },
  {
    day: 'Perşembe',
    lessons: [
       { id: '7', time: '11:30 - 12:10', subject: 'Matematik', class: '7/B' },
    ],
  },
  {
    day: 'Cuma',
    lessons: [
       { id: '8', time: '09:00 - 09:40', subject: 'Matematik', class: '6/A' },
       { id: '9', time: '10:40 - 11:20', subject: 'Matematik', class: '7/B' },
    ],
  },
  {
    day: 'Cumartesi',
    lessons: [],
  },
  {
    day: 'Pazar',
    lessons: [],
  },
];
