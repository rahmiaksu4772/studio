
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

export const statusOptions: { value: AttendanceStatus; label: string, icon?: LucideIcon, color?: string, bgColor?: string }[] = [
    { value: '+', label: 'Artı', icon: CheckCheck, color: 'text-green-600' },
    { value: 'P', label: 'Yarım', icon: Check, color: 'text-green-500' },
    { value: '-', label: 'Eksi', icon: X, color: 'text-red-600' },
    { value: 'Y', label: 'Yok', icon: UserX, color: 'text-yellow-600' },
    { value: 'G', label: 'İzinli', icon: FileCheck, color: 'text-blue-600' },
];

export type Note = {
  id: string;
  title: string;
  content: string;
  date: string;
  color: string;
  imageUrl?: string;
};

export type Plan = {
    id: string;
    title: string;
    type: 'annual' | 'weekly';
    fileDataUrl: string;
    uploadDate: string;
    fileType: string;
    fileName: string;
};

export type Lesson = {
  time: string;
  subject: string;
  class: string;
}

export type WeeklyScheduleItem = {
  day: string;
  lessons: Lesson[];
}
