import type { Student, ClassInfo } from './types';

export const classes: ClassInfo[] = [
  { id: '6b', name: '6-B' },
  { id: '5a', name: '5-A' },
  { id: '8c', name: '8-C' },
];

export const students: Student[] = [
  // 6-B
  { id: 's1', studentNumber: 123, firstName: 'Arda', lastName: 'Güler', classId: '6b' },
  { id: 's2', studentNumber: 124, firstName: 'Zeynep', lastName: 'Avcı', classId: '6b' },
  { id: 's3', studentNumber: 125, firstName: 'Kerem', lastName: 'Aktürkoğlu', classId: '6b' },
  { id: 's4', studentNumber: 126, firstName: 'Ebrar', lastName: 'Karakurt', classId: '6b' },
  { id: 's5', studentNumber: 127, firstName: 'Mete', lastName: 'Gazoz', classId: '6b' },
  // 5-A
  { id: 's6', studentNumber: 201, firstName: 'Cansu', lastName: 'Özbay', classId: '5a' },
  { id: 's7', studentNumber: 202, firstName: 'Ferdi', lastName: 'Kadıoğlu', classId: '5a' },
  // 8-C
  { id: 's8', studentNumber: 301, firstName: 'Melissa', lastName: 'Vargas', classId: '8c' },
  { id: 's9', studentNumber: 302, firstName: 'İlkin', lastName: 'Aydın', classId: '8c' },
  { id: 's10', studentNumber: 303, firstName: 'Barış', lastName: 'Alper Yılmaz', classId: '8c' },
];
