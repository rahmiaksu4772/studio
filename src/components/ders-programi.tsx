
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck, Trash2, Calendar, List } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const dayOrder: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
const allDays: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

type ProcessedSchedule = {
  times: string[];
  grid: (Lesson | null)[][];
};

export default function DersProgrami() {
  const { user } = useAuth();
  const { schedule, addLesson, deleteLesson, isLoading } = useWeeklySchedule(user?.uid);
  const [today] = React.useState(allDays[new Date().getDay() - 1] || 'Pazartesi');

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

    const sortedTimes = Array.from(allTimes).sort((a, b) => a.split(':')[0].localeCompare(b.split(':')[0]));

    const grid = sortedTimes.map(time => {
      return dayOrder.map(dayName => {
        const dayData = schedule.find(d => d.day === dayName);
        const lesson = dayData?.lessons.find(l => l.time === time);
        return lesson || null;
      });
    });

    return { times: sortedTimes, grid };
  }, [schedule]);

  const getLightBackgroundColor = (text: string) => {
    const color = getColorFromString(text);
    return `${color}40`; // Add alpha for lighter background
  };

  const getDarkTextColor = (text: string) => {
     return getColorFromString(text);
  };


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
    <Tabs defaultValue="weekly">
        <Card className="w-full overflow-hidden">
            <CardHeader className="flex flex-row justify-between items-center p-4">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <BookOpenCheck className="h-5 w-5" />
                    Haftalık Ders Programı
                </CardTitle>
                <div className='flex items-center gap-2'>
                    <TabsList>
                        <TabsTrigger value="weekly"><Calendar className="h-4 w-4 mr-2"/>Haftalık Görünüm</TabsTrigger>
                        <TabsTrigger value="daily"><List className="h-4 w-4 mr-2"/>Günlük Görünüm</TabsTrigger>
                    </TabsList>
                    <AddLessonForm day={'Pazartesi'} onAddLesson={addLesson} />
                </div>
            </CardHeader>
            
            <CardContent className="p-2 md:p-4">
                <TabsContent value="weekly">
                    <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-1 text-center overflow-x-auto">
                        {/* Header Row */}
                        <div className="font-bold p-2 text-muted-foreground sticky left-0 bg-background z-10">Saatler</div>
                        {dayOrder.map(day => (
                            <div key={day} className="font-bold bg-primary/10 text-primary p-2 rounded-t-lg min-w-[120px]">{day}</div>
                        ))}

                        {/* Schedule Rows */}
                        {processedSchedule.times.map((time, timeIndex) => (
                            <React.Fragment key={time}>
                                <div className="font-semibold p-2 my-1 flex items-center justify-center text-muted-foreground bg-muted/50 rounded-l-lg sticky left-0 z-10">{time}</div>
                                {processedSchedule.grid[timeIndex].map((lesson, dayIndex) => (
                                    <div 
                                        key={`${time}-${dayIndex}`} 
                                        className="group relative flex flex-col justify-center items-center p-2 border border-border rounded-md min-h-[70px] text-xs md:text-sm"
                                        style={{
                                            backgroundColor: lesson ? getLightBackgroundColor(lesson.subject) : 'transparent',
                                            color: lesson ? getDarkTextColor(lesson.subject) : undefined
                                        }}
                                    >
                                        {lesson ? (
                                            <>
                                                <p className="font-bold">{lesson.subject}</p>
                                                <p>{lesson.class}</p>
                                                
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className='absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity'>
                                                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
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
                                            <div className="w-full h-full"></div>
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
                </TabsContent>
                <TabsContent value="daily">
                    <Tabs defaultValue={today} className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            {dayOrder.map(day => (
                               <TabsTrigger key={day} value={day}>{day}</TabsTrigger>
                            ))}
                        </TabsList>
                        {dayOrder.map(day => (
                            <TabsContent key={day} value={day}>
                                <div className='mt-4 space-y-4'>
                                    {schedule.find(d => d.day === day)?.lessons.sort((a, b) => a.time.localeCompare(b.time)).map(lesson => (
                                       <Card key={lesson.id} className='flex items-center justify-between p-4'>
                                           <div>
                                               <p className='font-bold text-lg'>{lesson.subject}</p>
                                               <p className='text-muted-foreground'>{lesson.class} - {lesson.time}</p>
                                           </div>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Trash2 className="h-4 w-4 text-destructive" />
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
                                                    <AlertDialogAction onClick={() => deleteLesson(day, lesson.id)} className='bg-destructive hover:bg-destructive/90'>
                                                        Evet, Sil
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                       </Card>
                                    ))}
                                    {(schedule.find(d => d.day === day)?.lessons.length === 0 || !schedule.find(d => d.day === day)) && (
                                        <div className="text-center p-10 text-muted-foreground">
                                            <p>Bu gün için ders programı bulunmuyor.</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </TabsContent>
            </CardContent>
        </Card>
    </Tabs>
  );
}
