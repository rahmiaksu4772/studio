
import { type LucideIcon, UserX, CircleSlash, PlusCircle, MinusCircle, FileCheck } from "lucide-react";

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
export type RecordEventType = 'status' | 'note';
export type RecordEventValue = AttendanceStatus | string;

export type RecordEvent = {
    id: string;
    type: RecordEventType;
    value: RecordEventValue;
}

export type DailyRecord = {
  id: string; // Composite key: `${classId}-${date}-${studentId}`
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  events: RecordEvent[];
};

export const statusOptions: { value: AttendanceStatus; label: string, icon?: LucideIcon, color?: string, bgColor?: string }[] = [
    { value: '+', label: 'Artı', icon: PlusCircle, color: 'hsl(142.1, 70.6%, 45.1%)', bgColor: 'hsl(142.1, 76.2%, 95.1%)' },
    { value: 'P', label: 'Yarım', icon: CircleSlash, color: 'hsl(47.9, 95.8%, 53.1%)', bgColor: 'hsl(47.9, 95.8%, 95.1%)' },
    { value: '-', label: 'Eksi', icon: MinusCircle, color: 'hsl(0, 84.2%, 60.2%)', bgColor: 'hsl(0, 84.2%, 95.1%)' },
    { value: 'Y', label: 'Yok', icon: UserX, color: 'hsl(222.2, 47.4%, 11.2%)', bgColor: 'hsl(222.2, 47.4%, 95.1%)' },
    { value: 'G', label: 'İzinli', icon: FileCheck, color: 'hsl(221, 83%, 53%)', bgColor: 'hsl(221, 83%, 95.1%)' },
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
  id: string;
  time: string;
  subject: string;
  class: string;
}

export type Day = 'Pazartesi' | 'Salı' | 'Çarşamba' | 'Perşembe' | 'Cuma' | 'Cumartesi' | 'Pazar';

export type WeeklyScheduleItem = {
  day: Day;
  lessons: Lesson[];
}
