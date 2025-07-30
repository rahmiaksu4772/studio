
import type { Student, ClassInfo } from './types';

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
