import { type LucideIcon } from "lucide-react";

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

export type AttendanceStatus = '+' | '½' | '-' | 'G' | 'Y';

export type DailyRecord = {
  studentId: string;
  status: AttendanceStatus | null;
  description: string;
};

export const statusOptions: { value: AttendanceStatus; label: string, icon?: LucideIcon }[] = [
  { value: '+', label: 'Artı' },
  { value: '½', label: 'Yarım Artı' },
  { value: '-', label: 'Eksi' },
  { value: 'Y', label: 'Yok' },
  { value: 'G', label: 'Mazeretli' },
];
