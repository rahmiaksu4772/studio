
import type { Student, ClassInfo, DailyRecord, WeeklyScheduleItem } from './types';
import { format, subMonths, getDaysInMonth } from 'date-fns';

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

function getDaysArrayForLastMonth() {
    const today = new Date();
    const lastMonth = subMonths(today, 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth();
    const daysInMonth = getDaysInMonth(lastMonth);
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }
    return days;
}

const lastMonthDays = getDaysArrayForLastMonth();

const allRecords: DailyRecord[] = [];
const statuses: (DailyRecord['status'])[] = ['+', '+', '+', 'P', '-', 'Y', 'G', '+', '+'];
const descriptions = [
    'Derse harika katılım gösterdi.',
    'Ödevini zamanında ve eksiksiz teslim etti.',
    'Konuyla ilgili yaratıcı sorular sordu.',
    'Arkadaşına yardım etti.',
    'Biraz yorgun görünüyordu.',
    'Dersi dikkatle dinledi ancak katılımı azdı.',
    'Ödevini unutmuş.',
    'Derste malzemeleri eksikti.',
    'Doktor randevusu vardı.',
    'Ailevi nedenlerle izinliydi.',
    'Okul gezisindeydi.',
];

students.forEach(student => {
    lastMonthDays.forEach(day => {
        // Skip weekends
        if (day.getDay() === 0 || day.getDay() === 6) {
            return;
        }

        // Add some random chance of no record for a day
        if (Math.random() > 0.95) {
            return;
        }
        
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const randomDescription = Math.random() > 0.6 ? descriptions[Math.floor(Math.random() * descriptions.length)] : '';
        
        allRecords.push({
            id: `record-${student.id}-${day.getTime()}`,
            studentId: student.id,
            classId: student.classId,
            date: format(day, 'yyyy-MM-dd'),
            status: randomStatus,
            description: randomDescription,
        });
    });
});

export const dailyRecords: DailyRecord[] = allRecords;

export const weeklySchedule: WeeklyScheduleItem[] = [
  {
    day: 'Pazartesi',
    dayOfWeek: 'Monday',
    lessons: [
      { time: '08:30 - 09:10', subject: 'Matematik', class: '6/A' },
      { time: '09:20 - 10:00', subject: 'Matematik', class: '6/A' },
      { time: '10:10 - 10:50', subject: 'Türkçe', class: '7/B' },
      { time: '11:00 - 11:40', subject: 'Fen Bilimleri', class: '6/A' },
      { time: '12:40 - 13:20', subject: 'Matematik', class: '7/B' },
      { time: '13:30 - 14:10', subject: 'Matematik', class: '7/B' },
    ],
  },
  {
    day: 'Salı',
    dayOfWeek: 'Tuesday',
    lessons: [
      { time: '08:30 - 09:10', subject: 'Türkçe', class: '6/A' },
      { time: '09:20 - 10:00', subject: 'Sosyal Bilgiler', class: '7/B' },
      { time: '10:10 - 10:50', subject: 'Matematik', class: '6/A' },
      { time: '11:00 - 11:40', subject: 'Matematik', class: '6/A' },
      { time: '12:40 - 13:20', subject: 'Fen Bilimleri', class: '7/B' },
      { time: '13:30 - 14:10', subject: 'İngilizce', class: '7/B' },
    ],
  },
  {
    day: 'Çarşamba',
    dayOfWeek: 'Wednesday',
    lessons: [
      { time: '08:30 - 09:10', subject: 'Matematik', class: '7/B' },
      { time: '09:20 - 10:00', subject: 'Matematik', class: '7/B' },
      { time: '10:10 - 10:50', subject: 'Beden Eğitimi', class: '6/A' },
      { time: '11:00 - 11:40', subject: 'Beden Eğitimi', class: '6/A' },
      { time: '12:40 - 13:20', subject: 'Matematik', class: '6/A' },
    ],
  },
  {
    day: 'Perşembe',
    dayOfWeek: 'Thursday',
    lessons: [
       { time: '09:20 - 10:00', subject: 'Fen Bilimleri', class: '6/A' },
       { time: '10:10 - 10:50', subject: 'Fen Bilimleri', class: '6/A' },
       { time: '11:00 - 11:40', subject: 'Matematik', class: '7/B' },
       { time: '12:40 - 13:20', subject: 'Türkçe', class: '7/B' },
       { time: '13:30 - 14:10', subject: 'Türkçe', class: '7/B' },
    ],
  },
  {
    day: 'Cuma',
    dayOfWeek: 'Friday',
    lessons: [
       { time: '08:30 - 09:10', subject: 'Matematik', class: '6/A' },
       { time: '09:20 - 10:00', subject: 'Görsel Sanatlar', class: '7/B' },
       { time: '10:10 - 10:50', subject: 'Matematik', class: '7/B' },
    ],
  },
];
