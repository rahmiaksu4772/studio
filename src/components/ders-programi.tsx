
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpenCheck, Trash2, Plus, Loader2 } from 'lucide-react';
import type { Lesson, Day, WeeklyScheduleItem } from '@/lib/types';
import { useWeeklySchedule } from '@/hooks/use-weekly-schedule';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
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


const dayOrder: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const dayAbbreviations: Record<Day, string> = {
  'Pazartesi': 'P',
  'Salı': 'S',
  'Çarşamba': 'Ç',
  'Perşembe': 'P',
  'Cuma': 'C',
  'Cumartesi': 'C',
  'Pazar': 'P'
};
const dayColors = [
    'bg-orange-400 hover:bg-orange-500',
    'bg-sky-400 hover:bg-sky-500',
    'bg-rose-400 hover:bg-rose-500',
    'bg-yellow-400 hover:bg-yellow-500',
    'bg-purple-400 hover:bg-purple-500',
    'bg-slate-400 hover:bg-slate-500',
    'bg-gray-400 hover:bg-gray-500',
]


export default function DersProgrami() {
  const { user } = useAuth();
  const { schedule, setLessonsForDay, isLoading } = useWeeklySchedule(user?.uid);
  const { toast } = useToast();

  const handleAddLesson = (day: Day, lessonData: Omit<Lesson, 'id'>) => {
    const daySchedule = schedule.find(s => s.day === day);
    if (!daySchedule) return;
    
    const newLesson: Lesson = {
        ...lessonData,
        id: new Date().toISOString() + Math.random(),
    };

    const updatedLessons = [...daySchedule.lessons, newLesson];
    setLessonsForDay(day, updatedLessons);
    toast({ title: "Ders Eklendi!", description: `"${lessonData.subject}" dersi ${day} gününe eklendi.`});
  };

  const handleDeleteLesson = (day: Day, lessonId: string) => {
    const daySchedule = schedule.find(s => s.day === day);
    if (!daySchedule) return;

    const updatedLessons = daySchedule.lessons.filter(l => l.id !== lessonId);
    setLessonsForDay(day, updatedLessons);
    toast({ title: "Ders Silindi!", description: `Ders programdan kaldırıldı.`, variant: 'destructive'});
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Haftalık Ders Programı</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <BookOpenCheck className="h-5 w-5" />
          Haftalık Ders Programı
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="Pazartesi" className="w-full">
            <TabsList className="grid w-full grid-cols-7 gap-2 bg-transparent p-0">
                {dayOrder.map((day, index) => (
                    <TabsTrigger 
                        key={day} 
                        value={day}
                        className={`text-white font-bold data-[state=active]:ring-2 data-[state=active]:ring-primary data-[state=active]:ring-offset-2 transition-all duration-200 ${dayColors[index]}`}
                    >
                        {dayAbbreviations[day]}
                    </TabsTrigger>
                ))}
            </TabsList>
            {dayOrder.map((day, index) => {
                const daySchedule = schedule.find(s => s.day === day);
                const sortedLessons = daySchedule?.lessons.sort((a, b) => a.time.localeCompare(b.time)) || [];

                return (
                    <TabsContent key={day} value={day} className="space-y-4 mt-4">
                        <div className={`p-3 rounded-md text-center text-white font-bold text-lg ${dayColors[index].split(' ')[0]}`}>
                            {day}
                        </div>
                        <div className="border rounded-md">
                            <div className={`grid grid-cols-[auto_1fr_1fr_auto] items-center p-2 text-sm font-bold text-white ${dayColors[index].split(' ')[0]}`}>
                                <div className="px-2">#</div>
                                <div>Ders Adı</div>
                                <div>Sınıf</div>
                                <div className='text-center'>Zaman</div>
                            </div>
                            <ul className="divide-y divide-border">
                                {sortedLessons.length > 0 ? sortedLessons.map((lesson, lessonIndex) => (
                                <li key={lesson.id} className="grid grid-cols-[auto_1fr_1fr_auto] items-center p-3 hover:bg-muted/50 gap-2">
                                    <div className='font-semibold px-2'>{lessonIndex + 1}</div>
                                    <div className='font-medium'>{lesson.subject}</div>
                                    <div className='text-muted-foreground'>{lesson.class}</div>
                                    <div className='flex items-center gap-2'>
                                        <span className="font-mono text-sm">{lesson.time}</span>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className='h-8 w-8'>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                             <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Dersi Sil</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        "{lesson.subject}" dersini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteLesson(day, lesson.id)}>Evet, Sil</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </li>
                                )) : (
                                    <li className='text-center p-8 text-muted-foreground'>
                                        Bu gün için ders eklenmemiş.
                                    </li>
                                )}
                            </ul>
                        </div>
                        <div className="flex justify-end">
                            <AddLessonForm day={day} onAddLesson={handleAddLesson} />
                        </div>
                    </TabsContent>
                )
            })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
