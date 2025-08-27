
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck } from 'lucide-react';
import { weeklySchedule as initialSchedule } from '@/lib/mock-data';
import type { Lesson } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WeeklyScheduleItem {
  day: string;
  dayShort: string;
  dayColor: string;
  lessons: Lesson[];
}

const scheduleData: WeeklyScheduleItem[] = [
  { day: 'PAZARTESİ', dayShort: 'P', dayColor: 'bg-orange-500', lessons: initialSchedule.find(d => d.day === 'Pazartesi')?.lessons || [] },
  { day: 'SALI', dayShort: 'S', dayColor: 'bg-cyan-500', lessons: initialSchedule.find(d => d.day === 'Salı')?.lessons || [] },
  { day: 'ÇARŞAMBA', dayShort: 'Ç', dayColor: 'bg-red-500', lessons: initialSchedule.find(d => d.day === 'Çarşamba')?.lessons || [] },
  { day: 'PERŞEMBE', dayShort: 'P', dayColor: 'bg-yellow-500', lessons: initialSchedule.find(d => d.day === 'Perşembe')?.lessons || [] },
  { day: 'CUMA', dayShort: 'C', dayColor: 'bg-purple-500', lessons: initialSchedule.find(d => d.day === 'Cuma')?.lessons || [] },
  { day: 'CUMARTESİ', dayShort: 'C', dayColor: 'bg-slate-500', lessons: initialSchedule.find(d => d.day === 'Cumartesi')?.lessons || [] },
  { day: 'PAZAR', dayShort: 'P', dayColor: 'bg-gray-400', lessons: initialSchedule.find(d => d.day === 'Pazar')?.lessons || [] },
];

export default function DersProgrami() {
  const [activeDay, setActiveDay] = React.useState<string>('PAZARTESİ');
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const todayIndex = new Date().getDay();
    // Sunday is 0, Monday is 1... Adjust to match our array (Pazartesi is 0)
    const adjustedDayIndex = todayIndex === 0 ? 6 : todayIndex - 1;
    if(scheduleData[adjustedDayIndex]) {
       setActiveDay(scheduleData[adjustedDayIndex].day);
    }
  }, []);

  const activeDayData = scheduleData.find(d => d.day === activeDay);

  if (!isMounted) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <BookOpenCheck className="h-5 w-5" />
                    Haftalık Ders Programı
                </CardTitle>
            </CardHeader>
            <CardContent>
                 <Skeleton className="w-full h-[300px]" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
        <div className="flex justify-between items-center p-4">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <BookOpenCheck className="h-5 w-5" />
                Haftalık Ders Programı
            </CardTitle>
        </div>

        <div className="grid grid-cols-7 gap-1 p-2 bg-gray-100 dark:bg-gray-800">
            {scheduleData.map(day => (
                <button
                    key={day.day}
                    onClick={() => setActiveDay(day.day)}
                    className={cn(
                        'flex items-center justify-center aspect-square rounded-md text-white font-bold text-xl md:text-2xl transition-all duration-200 transform',
                        day.dayColor,
                        activeDay === day.day ? 'ring-2 ring-offset-2 ring-primary scale-105' : 'opacity-70 hover:opacity-100'
                    )}
                >
                    {day.dayShort}
                </button>
            ))}
        </div>
      
        <div className={cn("p-4 text-white", activeDayData?.dayColor)}>
            <h3 className="text-center font-bold text-2xl tracking-widest">{activeDayData?.day}</h3>
        </div>
        
        <CardContent className="p-0">
            {activeDayData && activeDayData.lessons.length > 0 ? (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className='bg-red-500 hover:bg-red-500/90'>
                                <TableHead className="w-12 text-white">#</TableHead>
                                <TableHead className="text-white">Ders Adı</TableHead>
                                <TableHead className="text-right text-white">Zaman</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeDayData.lessons.map((lesson, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>
                                        <p className="font-semibold">{lesson.subject}</p>
                                        <p className="text-xs text-muted-foreground">{lesson.class}</p>
                                    </TableCell>
                                    <TableCell className="text-right">{lesson.time}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="text-center p-10 text-muted-foreground">
                    <p>Bugün için ders programı bulunmuyor.</p>
                </div>
            )}
        </CardContent>
    </Card>
  );
}
