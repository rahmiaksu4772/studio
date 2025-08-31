
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpenCheck, Trash2, Crown } from 'lucide-react';
import type { Lesson, Day, WeeklyScheduleItem } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { useWeeklySchedule } from '@/hooks/use-weekly-schedule';
import { AddLessonForm } from './add-lesson-form';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import getColorFromString from 'string-to-color';
import { Badge } from './ui/badge';


const dayOrder: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

type ProcessedSchedule = {
  times: string[];
  grid: (Lesson | null)[][];
};

export default function DersProgrami() {
  const { user } = useAuth();
  const { schedule, addLesson, deleteLesson, isLoading } = useWeeklySchedule(user?.uid);

  const processedSchedule: ProcessedSchedule = React.useMemo(() => {
    if (!schedule || schedule.length === 0) {
      return { times: [], grid: [] };
    }

    const allTimes = new Set<string>();
    schedule.forEach(day => {
      day.lessons.forEach(lesson => {
        allTimes.add(lesson.time);
      });
    });

    const sortedTimes = Array.from(allTimes).sort((a, b) => {
        const timeA = parseInt(a.split(':')[0], 10) * 60 + parseInt(a.split(':')[1], 10);
        const timeB = parseInt(b.split(':')[0], 10) * 60 + parseInt(b.split(':')[1], 10);
        return timeA - timeB;
    });

    const grid = sortedTimes.map(time => {
      return dayOrder.map(dayName => {
        const dayData = schedule.find(d => d.day === dayName);
        const lesson = dayData?.lessons.find(l => l.time === time);
        return lesson || null;
      });
    });

    return { times: sortedTimes, grid };
  }, [schedule]);

  if (isLoading) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <BookOpenCheck className="h-5 w-5" />
                    Haftalık Ders Programı
                </CardTitle>
            </CardHeader>
            <CardContent>
                 <Skeleton className="w-full h-[400px]" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
        <CardHeader className="flex-col md:flex-row justify-between items-start md:items-center p-4">
            <div>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <BookOpenCheck className="h-5 w-5" />
                    Haftalık Ders Programı
                    <Badge variant="premium" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        <Crown className='h-4 w-4 mr-1'/>
                        Premium
                    </Badge>
                </CardTitle>
                <CardDescription>Tüm haftalık programınızı tek bir yerden yönetin.</CardDescription>
            </div>
            <AddLessonForm day={'Pazartesi'} onAddLesson={addLesson} />
        </CardHeader>
        
        <CardContent className="p-2 md:p-4">
            <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-1 text-center font-sans">
                {/* Header Row */}
                <div className="p-2 sticky left-0 bg-background z-10"></div>
                {dayOrder.map(day => (
                    <div key={day} className="font-bold bg-primary/80 text-primary-foreground p-2 rounded-t-lg min-w-[100px] md:min-w-[120px] text-sm md:text-base">
                        {day.substring(0,3).toLocaleUpperCase('tr-TR')}
                    </div>
                ))}

                {/* Schedule Rows */}
                {processedSchedule.times.map((time, timeIndex) => (
                    <React.Fragment key={time}>
                        <div className="font-semibold p-2 my-1 flex items-center justify-center text-muted-foreground bg-muted/30 rounded-l-lg sticky left-0 z-10 text-xs md:text-sm">{time}</div>
                        {processedSchedule.grid[timeIndex].map((lesson, dayIndex) => (
                            <div 
                                key={`${time}-${dayIndex}`} 
                                className="group relative flex flex-col justify-center items-center p-2 rounded-md min-h-[70px] text-xs md:text-sm text-white shadow-inner"
                                style={{
                                    backgroundColor: lesson ? getColorFromString(lesson.subject) : '#f1f5f9'
                                }}
                            >
                                {lesson ? (
                                    <>
                                        <p className="font-bold drop-shadow-sm">{lesson.subject}</p>
                                        <p className="opacity-80 drop-shadow-sm">{lesson.class}</p>
                                        
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className='absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 text-white hover:text-white'>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Dersi Silmek İstediğinize Emin misiniz?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Bu işlem geri alınamaz. "{lesson.subject} - {lesson.time}" dersini kalıcı olarak silecektir.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteLesson(dayOrder[dayIndex], lesson.id)} className='bg-destructive hover:bg-destructive/90'>
                                                        Evet, Sil
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                    </>
                                ) : (
                                    <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-md"></div>
                                )}
                            </div>
                        ))}
                    </React.Fragment>
                ))}

                {processedSchedule.times.length === 0 && (
                    <div className="col-span-6 text-center p-10 text-muted-foreground">
                        <p>Henüz ders programı oluşturulmamış.</p>
                        <p className='text-xs'>Başlamak için "Ders Ekle" butonunu kullanın.</p>
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
