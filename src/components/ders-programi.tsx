
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck, Trash2 } from 'lucide-react';
import type { Lesson, Day } from '@/lib/types';
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

const dayOrder: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const dayDetails: Record<Day, { short: string; color: string }> = {
    'Pazartesi': { short: 'P', color: 'bg-orange-500' },
    'Salı': { short: 'S', color: 'bg-cyan-500' },
    'Çarşamba': { short: 'Ç', color: 'bg-red-500' },
    'Perşembe': { short: 'P', color: 'bg-yellow-500' },
    'Cuma': { short: 'C', color: 'bg-purple-500' },
    'Cumartesi': { short: 'C', color: 'bg-slate-500' },
    'Pazar': { short: 'P', color: 'bg-gray-400' },
};


export default function DersProgrami() {
  const { user } = useAuth();
  const { schedule, addLesson, deleteLesson, isLoading } = useWeeklySchedule(user?.uid);
  const [activeDay, setActiveDay] = React.useState<Day>('Pazartesi');
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const todayIndex = new Date().getDay();
    const adjustedDayIndex = todayIndex === 0 ? 6 : todayIndex - 1;
    if(dayOrder[adjustedDayIndex]) {
       setActiveDay(dayOrder[adjustedDayIndex]);
    }
  }, []);

  const activeDayData = schedule.find(d => d.day === activeDay);
  const activeDayColor = dayDetails[activeDay]?.color || 'bg-gray-500';

  if (!isMounted || isLoading) {
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
            {dayOrder.map(day => (
                <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={cn(
                        'flex items-center justify-center aspect-square rounded-md text-white font-bold text-xl md:text-2xl transition-all duration-200 transform',
                        dayDetails[day].color,
                        activeDay === day ? 'ring-2 ring-offset-2 ring-primary scale-105' : 'opacity-70 hover:opacity-100'
                    )}
                >
                    {dayDetails[day].short}
                </button>
            ))}
        </div>
      
        <div className={cn("p-4 text-white", activeDayColor)}>
            <h3 className="text-center font-bold text-2xl tracking-widest">{activeDay}</h3>
        </div>
        
        <CardContent className="p-0">
            {activeDayData && activeDayData.lessons.length > 0 ? (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className={cn('hover:bg-muted/50', activeDayColor)}>
                                <TableHead className="w-12 text-white">#</TableHead>
                                <TableHead className="text-white">Ders Adı</TableHead>
                                <TableHead className="text-white">Sınıf</TableHead>
                                <TableHead className="text-right text-white">Zaman</TableHead>
                                <TableHead className="w-12 text-right text-white"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeDayData.lessons
                                .sort((a,b) => a.time.localeCompare(b.time))
                                .map((lesson, index) => (
                                <TableRow key={lesson.id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>{lesson.subject}</TableCell>
                                    <TableCell>{lesson.class}</TableCell>
                                    <TableCell className="text-right">{lesson.time}</TableCell>
                                    <TableCell className="text-right">
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className='h-8 w-8'>
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
                                                    <AlertDialogAction onClick={() => deleteLesson(activeDay, lesson.id)} className='bg-destructive hover:bg-destructive/90'>
                                                        Evet, Sil
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
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
             <div className="p-4 flex justify-center">
                <AddLessonForm day={activeDay} onAddLesson={addLesson} />
            </div>
        </CardContent>
    </Card>
  );
}
