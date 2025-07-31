

import type { Student, ClassInfo, DailyRecord, WeeklyScheduleItem, Exam } from './types';
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

// Generate some data for today
const today = new Date();
if (today.getDay() !== 0 && today.getDay() !== 6) {
    students.forEach(student => {
        if (Math.random() > 0.3) { // 70% chance to have a record for today
             const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
             const randomDescription = Math.random() > 0.5 ? descriptions[Math.floor(Math.random() * descriptions.length)] : '';
             allRecords.push({
                id: `record-${student.id}-${today.getTime()}`,
                studentId: student.id,
                classId: student.classId,
                date: format(today, 'yyyy-MM-dd'),
                status: randomStatus,
                description: randomDescription,
            });
        }
    });
}


export const dailyRecords: DailyRecord[] = allRecords;

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


export const mockExams: Exam[] = [
    {
        id: 'mock_exam_1',
        title: '6. Sınıf Matematik - Kesirler Değerlendirme',
        questions: [
            {
                question: 'Aşağıdaki kesirlerden hangisi yarıma eşittir?',
                options: ['1/3', '2/4', '3/5', '4/7'],
                correctAnswer: 'B'
            },
            {
                question: 'Bir pastanın 3/8\'ini Ahmet, 2/8\'ini Zeynep yemiştir. Pastanın ne kadarı yenmiştir?',
                options: ['4/8', '5/8', '6/8', '7/8'],
                correctAnswer: 'B'
            },
            {
                question: '2/5 kesrinin ondalık gösterimi aşağıdakilerden hangisidir?',
                options: ['0.2', '0.3', '0.4', '0.5'],
                correctAnswer: 'C'
            }
        ]
    },
    {
        id: 'mock_exam_2',
        title: '7. Sınıf Türkçe - Cümlenin Öğeleri',
        questions: [
            {
                question: '"Genç şair, duygulu şiirlerini okurken herkesi etkiledi." cümlesinin öznesi aşağıdakilerden hangisidir?',
                options: ['herkesi', 'Genç şair', 'duygulu şiirlerini', 'etkiledi'],
                correctAnswer: 'B'
            },
            {
                question: 'Aşağıdaki cümlelerin hangisinde yer tamlayıcısı (dolaylı tümleç) yoktur?',
                options: [
                    'Okuldan eve yürüdüm.', 
                    'Sabahları erken kalkarım.', 
                    'Kitabı masaya bıraktı.', 
                    'Bahçede oynuyorlar.'
                ],
                correctAnswer: 'B'
            }
        ]
    },
    {
        id: 'mock_exam_3',
        title: '6. Sınıf Fen Bilimleri - Güneş Sistemi',
        questions: [
            {
                question: 'Güneş sistemindeki en büyük gezegen hangisidir?',
                options: ['Dünya', 'Mars', 'Jüpiter', 'Satürn'],
                correctAnswer: 'C'
            },
            {
                question: 'Aşağıdaki görselde ok ile gösterilen gezegen hangisidir?',
                imageUrl: 'https://placehold.co/400x200.png', // Placeholder for a planet image
                options: ['Venüs', 'Dünya', 'Mars', 'Neptün'],
                correctAnswer: 'C'
            }
        ]
    }
];
