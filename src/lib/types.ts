import { type LucideIcon, PlusCircle, MinusCircle, CircleSlash, ThumbsUp, ThumbsDown, UserCheck, UserX, GraduationCap } from "lucide-react";

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

export const statusOptions: { value: AttendanceStatus; label: string, icon?: LucideIcon, color?: string }[] = [
  { value: '+', label: 'Artı (Katılım, Başarı)', icon: ThumbsUp, color: 'text-green-600' },
  { value: '½', label: 'Yarım Artı (Çaba)', icon: CircleSlash, color: 'text-green-500' },
  { value: '-', label: 'Eksi (Eksiklik, Olumsuz Davranış)', icon: ThumbsDown, color: 'text-red-600' },
  { value: 'Y', label: 'Yok (Derse Gelmedi)', icon: UserX, color: 'text-yellow-600' },
  { value: 'G', label: 'Mazeretli (İzinli)', icon: UserCheck, color: 'text-blue-600' },
];
