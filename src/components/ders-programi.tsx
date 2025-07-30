
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck, Clock, Plus, Save, Trash2 } from 'lucide-react';
import { weeklySchedule as initialSchedule } from '@/lib/mock-data';
import type { WeeklyScheduleItem, Lesson } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';

const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export default function DersProgrami() {
  const { toast } = useToast();
  const [schedule, setSchedule] = React.useState<WeeklyScheduleItem[]>(initialSchedule);
  const [activeDay, setActiveDay] = React.useState<string>(daysOfWeek[0]);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    // This effect runs only on the client, after hydration
    setIsClient(true);
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
    if (dayIndex === -1) return;
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

  if (!isClient) {
    // Render a placeholder or null on the server to avoid mismatch
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                        <BookOpenCheck className="h-5 w-5" />
                        Haftalık Ders Programı
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="min-h-[400px] flex items-center justify-center">
                 {/* You can add a skeleton loader here if you prefer */}
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
        <div className="mb-4 overflow-x-auto pb-2">
          <div className="flex w-full space-x-1 sm:space-x-2">
            {schedule.map(day => (
              <button
                key={day.day}
                onClick={() => setActiveDay(day.day)}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap flex-1 sm:flex-auto',
                   day.color,
                  activeDay === day.day
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'text-foreground/80'
                )}
              >
                {day.day}
              </button>
            ))}
          </div>
        </div>
        
        <div className="rounded-lg border p-4 min-h-[300px] bg-muted/30">
            {activeDayIndex !== -1 && schedule[activeDayIndex].lessons.map((lesson, lessonIndex) => (
                 <div key={lessonIndex} 
                    className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center p-2 rounded-lg transition-all hover:bg-background/80"
                >
                    <div className="flex items-center gap-2 font-semibold text-primary col-span-1 md:col-span-2">
                        <Clock className="h-5 w-5 flex-shrink-0" />
                        <Input
                            value={lesson.time}
                            onChange={(e) => handleLessonChange(activeDayIndex, lessonIndex, 'time', e.target.value)}
                            className="bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-primary h-9"
                        />
                    </div>
                    <div className="col-span-1 md:col-span-3">
                         <Input
                            value={lesson.subject}
                            onChange={(e) => handleLessonChange(activeDayIndex, lessonIndex, 'subject', e.target.value)}
                            className="font-bold text-md bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-primary h-9"
                        />
                        <Input
                            value={lesson.class}
                            onChange={(e) => handleLessonChange(activeDayIndex, lessonIndex, 'class', e.target.value)}
                            className="text-sm text-muted-foreground bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-primary h-8 -mt-1"
                        />
                    </div>
                    <div className="flex items-center justify-end">
                       <Button variant="ghost" size="icon" onClick={() => deleteLesson(activeDayIndex, lessonIndex)}>
                           <Trash2 className="h-4 w-4 text-destructive" />
                       </Button>
                    </div>
                 </div>
            ))}
            {activeDayIndex !== -1 && schedule[activeDayIndex].lessons.length === 0 && (
                <div className="text-center p-8 text-muted-foreground h-full flex flex-col items-center justify-center">
                    <p className='font-semibold'>Bugün ders programı boş.</p>
                    <p className='text-sm'>Yeni bir ders ekleyerek başlayabilirsiniz.</p>
                </div>
            )}
             <Button variant="outline" className="w-full mt-4" onClick={() => addLesson(activeDayIndex)}>
                <Plus className="mr-2 h-4 w-4"/>
                Yeni Ders Ekle
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
