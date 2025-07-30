import { type LucideIcon, ThumbsUp, CircleSlash, ThumbsDown, UserCheck, UserX } from "lucide-react";

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
};

export const statusOptions: { value: AttendanceStatus; label: string, icon?: LucideIcon, color?: string }[] = [
    { value: '+', label: 'Artı', icon: ThumbsUp, color: 'text-green-600' },
    { value: '½', label: 'Yarım', icon: CircleSlash, color: 'text-green-500' },
    { value: '-', label: 'Eksi', icon: ThumbsDown, color: 'text-red-600' },
    { value: 'Y', label: 'Yok', icon: UserX, color: 'text-yellow-600' },
    { value: 'G', label: 'İzinli', icon: UserCheck, color: 'text-blue-600' },
];
