export type Student = {
  id: string;
  studentNumber: number;
  firstName: string;
  lastName: string;
  classId: string;
};

export type ClassInfo = {
  id: string;
  name: string;
};

export type AttendanceStatus = '+' | '-' | 'G' | 'Y' | 'A';

export type DailyRecord = {
  studentId: string;
  status: AttendanceStatus | null;
  description: string;
};

export const statusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: '+', label: 'Katıldı' },
  { value: '-', label: 'Katılmadı - İzinsiz' },
  { value: 'G', label: 'Gelmedi - Mazeretli' },
  { value: 'Y', label: 'Yarım Gün' },
  { value: 'A', label: 'Artılı' },
];
