
import type { Student, ClassInfo } from './types';

export const classes: ClassInfo[] = [
  { id: '6b', name: '6/A' },
  { id: '5a', name: '7/B' },
];

export const students: Student[] = [
  // 6/A
  { id: 's1', studentNumber: 123, firstName: 'Ahmet', lastName: 'Yılmaz', classId: '6b' },
  { id: 's2', studentNumber: 124, firstName: 'Ayşe', lastName: 'Kaya', classId: '6b' },
  { id: 's3', studentNumber: 125, firstName: 'Mehmet', lastName: 'Demir', classId: '6b' },
  { id: 's4', studentNumber: 126, firstName: 'Zeynep', lastName: 'Özkan', classId: '6b' },
  { id: 's5', studentNumber: 127, firstName: 'Can', lastName: 'Arslan', classId: '6b' },
];
