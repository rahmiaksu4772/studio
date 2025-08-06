
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck, Clock, Plus, Save, Trash2 } from 'lucide-react';
import { weeklySchedule as initialSchedule } from '@/lib/mock-data';
import type { Lesson } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

interface WeeklyScheduleItem {
  day: string;
  lessons: Lesson[];
}

const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export default function DersProgrami() {
  const { toast } = useToast();
  const [schedule, setSchedule] = React.useState<WeeklyScheduleItem[]>(initialSchedule);
  const [activeDay, setActiveDay] = React.useState<string>(daysOfWeek[0]);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const todayIndex = new Date().getDay();
    // Sunday is 0, Monday is 1... Adjust to match our array (Monday is 0)
    const adjustedDayIndex = todayIndex === 0 ? 6 : todayIndex - 1;
    if(daysOfWeek[adjustedDayIndex]) {
       setActiveDay(daysOfWeek[adjustedDayIndex]);
    }
  }, []);


  const handleLessonChange = (dayIndex: number, lessonIndex: number, field: keyof Lesson, value: string) => {
    const newSchedule = [...schedule];
    (newSchedule[dayIndex].lessons[lessonIndex] as any)[field] = value;
    setSchedule(newSchedule);
  };
  
  const addLesson = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].lessons.push({ time: '00:00 - 00:00', subject: 'Yeni Ders', class: 'Sınıf' });
    setSchedule(newSchedule);
  };
  
  const deleteLesson = (dayIndex: number, lessonIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].lessons.splice(lessonIndex, 1);
    setSchedule(newSchedule);
  };

  const handleSaveChanges = () => {
    console.log('Kaydedilen Program:', schedule);
    toast({
      title: 'Program Kaydedildi',
      description: 'Ders programındaki değişiklikler başarıyla kaydedildi. (Konsolu kontrol edin)',
    });
  };
  
  const activeDayIndex = schedule.findIndex(d => d.day === activeDay);

  if (!isMounted) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5" />
            Haftalık Ders Programı
            </CardTitle>
            <Button onClick={handleSaveChanges}>
                <Save className='mr-2 h-4 w-4' />
                Değişiklikleri Kaydet
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex space-x-2 border-b">
            {schedule.map(day => (
              <button
                key={day.day}
                onClick={() => setActiveDay(day.day)}
                className={cn(
                  'px-4 py-2 text-sm font-medium',
                  activeDay === day.day
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {day.day}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
            {activeDayIndex !== -1 && schedule[activeDayIndex].lessons.map((lesson, lessonIndex) => (
                 <div key={`${activeDayIndex}-${lessonIndex}`} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
                     <div className="flex items-center gap-2 font-semibold text-primary">
                         <Clock className="h-5 w-5" />
                         <Input
                            value={lesson.time}
                            onChange={(e) => handleLessonChange(activeDayIndex, lessonIndex, 'time', e.target.value)}
                            className="bg-transparent border-0 focus-visible:ring-1"
                        />
                     </div>
                     <div className="flex-grow">
                         <Input
                            value={lesson.subject}
                            onChange={(e) => handleLessonChange(activeDayIndex, lessonIndex, 'subject', e.target.value)}
                            className="font-bold text-lg bg-transparent border-0 focus-visible:ring-1"
                        />
                         <Input
                            value={lesson.class}
                            onChange={(e) => handleLessonChange(activeDayIndex, lessonIndex, 'class', e.target.value)}
                            className="text-sm text-muted-foreground bg-transparent border-0 focus-visible:ring-1"
                        />
                     </div>
                     <Button variant="ghost" size="icon" onClick={() => deleteLesson(activeDayIndex, lessonIndex)}>
                         <Trash2 className="h-4 w-4 text-destructive" />
                     </Button>
                 </div>
            ))}
             <Button variant="outline" className="w-full mt-4" onClick={() => addLesson(activeDayIndex)}>
                <Plus className="mr-2 h-4 w-4"/>
                Yeni Ders Ekle
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
