
import type { Student, ClassInfo, DailyRecord } from './types';

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
];


function getDaysArray(year: number, month: number) {
    const date = new Date(year, month - 1, 1);
    const days = [];
    while (date.getMonth() === month - 1) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
}

function formatDate(date: Date) {
    return date.toISOString().split('T')[0];
}

const currentYear = new Date().getFullYear();
const lastMonth = new Date().getMonth(); 
const lastMonthDays = getDaysArray(currentYear, lastMonth);

const allRecords: DailyRecord[] = [];
const statuses: (DailyRecord['status'])[] = ['+', '+', '+', '½', '-', 'Y', 'G'];
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

        // Add some random chance of no record
        if (Math.random() > 0.9) {
            return;
        }
        
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const randomDescription = Math.random() > 0.7 ? descriptions[Math.floor(Math.random() * descriptions.length)] : '';
        
        allRecords.push({
            studentId: student.id,
            classId: student.classId,
            date: formatDate(day),
            status: randomStatus,
            description: randomDescription,
        });
    });
});

export const dailyRecords: DailyRecord[] = allRecords;
