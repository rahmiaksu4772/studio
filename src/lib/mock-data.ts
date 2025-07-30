import type { Student, ClassInfo } from './types';

export const classes: ClassInfo[] = [
  { id: '10a', name: '10-A' },
  { id: '9b', name: '9-B' },
  { id: '11c', name: '11-C' },
];

export const students: Student[] = [
  // 10-A
  { id: 's1', studentNumber: 101, firstName: 'Ayşe', lastName: 'Yılmaz', classId: '10a' },
  { id: 's2', studentNumber: 102, firstName: 'Mehmet', lastName: 'Kaya', classId: '10a' },
  { id: 's3', studentNumber: 103, firstName: 'Fatma', lastName: 'Demir', classId: '10a' },
  { id: 's4', studentNumber: 104, firstName: 'Ali', lastName: 'Çelik', classId: '10a' },
  { id: 's5', studentNumber: 105, firstName: 'Zeynep', lastName: 'Arslan', classId: '10a' },
  // 9-B
  { id: 's6', studentNumber: 201, firstName: 'Mustafa', lastName: 'Doğan', classId: '9b' },
  { id: 's7', studentNumber: 202, firstName: 'Hasan', lastName: 'Yıldız', classId: '9b' },
  // 11-C
  { id: 's8', studentNumber: 301, firstName: 'Elif', lastName: 'Şahin', classId: '11c' },
  { id: 's9', studentNumber: 302, firstName: 'Emre', lastName: 'Turan', classId: '11c' },
  { id: 's10', studentNumber: 303, firstName: 'Seda', lastName: 'Kurt', classId: '11c' },
];
