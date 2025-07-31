

import { type LucideIcon, UserCheck, UserX, CheckCheck, Check, X, FileCheck } from "lucide-react";

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

export type AttendanceStatus = '+' | 'P' | '-' | 'G' | 'Y';

export type DailyRecord = {
  id: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus | null;
  description?: string;
};

export const statusOptions: { value: AttendanceStatus; label: string, icon?: LucideIcon, color?: string }[] = [
    { value: '+', label: 'Artı', icon: CheckCheck, color: 'text-green-600' },
    { value: 'P', label: 'Yarım Artı', icon: Check, color: 'text-green-500' },
    { value: '-', label: 'Eksi', icon: X, color: 'text-red-600' },
    { value: 'Y', label: 'Yok', icon: UserX, color: 'text-yellow-600' },
    { value: 'G', label: 'İzinli', icon: FileCheck, color: 'text-blue-600' },
];
