
import type { WeeklyScheduleItem, Lesson } from './types';

// All data is now fetched from Firestore. Mock data is no longer needed.
export const classes = [];
export const students = [];
export const dailyRecords = [];


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
