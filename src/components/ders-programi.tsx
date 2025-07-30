
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck, Clock } from 'lucide-react';
import { weeklySchedule } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';

const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

const getCurrentLessonIndex = (lessons: any[]) => {
  const now = new Date();
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const [startTimeStr, endTimeStr] = lesson.time.split(' - ');
    const startTime = parse(startTimeStr, 'HH:mm', new Date());
    const endTime = parse(endTimeStr, 'HH:mm', new Date());
    
    // Set date to today for accurate comparison
    const today = new Date();
    startTime.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
    endTime.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());

    if (now >= startTime && now <= endTime) {
      return i;
    }
  }
  return -1;
};


export default function DersProgrami() {
    const todayStr = format(new Date(), 'EEEE'); // e.g., "Monday"
    const todayTurkish = weeklySchedule.find(d => d.dayOfWeek === todayStr)?.day || '';
    const [currentDay, setCurrentDay] = React.useState(todayTurkish || daysOfWeek[0]);
    
    const [currentLessonIndex, setCurrentLessonIndex] = React.useState(-1);

    React.useEffect(() => {
        const todaySchedule = weeklySchedule.find(d => d.day === currentDay);
        if (todaySchedule) {
            const lessonIndex = getCurrentLessonIndex(todaySchedule.lessons);
            setCurrentLessonIndex(lessonIndex);
        }

        const interval = setInterval(() => {
            if (todaySchedule) {
                const lessonIndex = getCurrentLessonIndex(todaySchedule.lessons);
                setCurrentLessonIndex(lessonIndex);
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [currentDay]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpenCheck className="h-5 w-5" />
          Haftalık Ders Programı
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 overflow-x-auto pb-2">
          <div className="flex w-full space-x-2">
            {daysOfWeek.map(day => (
              <button
                key={day}
                onClick={() => setCurrentDay(day)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                  currentDay === day
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        
        <div className="rounded-lg border overflow-hidden">
            {weeklySchedule.find(d => d.day === currentDay)?.lessons.map((lesson, index) => (
                 <div key={index} 
                    className={cn(
                        "grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 transition-all",
                        index < weeklySchedule.find(d => d.day === currentDay)!.lessons.length - 1 && "border-b",
                        index === currentLessonIndex && todayTurkish === currentDay && "bg-primary/10 ring-2 ring-primary/50"
                    )}
                >
                    <div className="flex items-center gap-3 font-semibold text-primary">
                        <Clock className="h-5 w-5" />
                        <span>{lesson.time}</span>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <p className="font-bold text-lg">{lesson.subject}</p>
                        <p className="text-sm text-muted-foreground">{lesson.class}</p>
                    </div>
                    {index === currentLessonIndex && todayTurkish === currentDay && (
                        <div className="flex items-center justify-start md:justify-end">
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800 animate-pulse">
                                Şimdi
                            </span>
                        </div>
                    )}
                 </div>
            ))}
            {weeklySchedule.find(d => d.day === currentDay)?.lessons.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    Bugün ders programı boş.
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
