
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import type { Lesson, Day, WeeklyScheduleItem } from '@/lib/types';
import { useWeeklySchedule } from '@/hooks/use-weekly-schedule';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { AddLessonForm } from './add-lesson-form';
import stringToColor from 'string-to-color';
import { cn } from '@/lib/utils';


const dayOrder: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
const dayAbbreviations: Record<Day, string> = { 'Pazartesi': 'PZT', 'Salı': 'SALI', 'Çarşamba': 'ÇAR', 'Perşembe': 'PER', 'Cuma': 'CUM', 'Cumartesi': 'CMT', 'Pazar': 'PAZ' };
const totalSlots = 8;

export default function DersProgrami() {
  const { user } = useAuth();
  const { schedule, isLoading, updateLesson } = useWeeklySchedule(user?.uid);
  const { toast } = useToast();
  const [editingLesson, setEditingLesson] = React.useState<{ day: Day, lessonSlot: number, lesson: Lesson | null } | null>(null);

  const handleLessonSave = async (day: Day, lessonSlot: number, lessonData: Omit<Lesson, 'id'>) => {
    const lessonToSave: Lesson = {
        id: editingLesson?.lesson?.id || `${day}-${lessonSlot}-${new Date().getTime()}`,
        ...lessonData
    };
    
    await updateLesson(day, lessonSlot, lessonToSave);
    toast({ title: "Ders Kaydedildi!", description: `${lessonData.subject} dersi programa eklendi.` });
    setEditingLesson(null);
  };
  
  const handleClearLesson = async (day: Day, lessonSlot: number) => {
     await updateLesson(day, lessonSlot, null);
     toast({ title: "Ders Temizlendi!", variant: 'destructive' });
     setEditingLesson(null);
  }

  const getLessonForSlot = (day: Day, slot: number): Lesson | undefined => {
    const daySchedule = schedule.find(d => d.day === day);
    return daySchedule?.lessons.find(l => l.lessonSlot === slot);
  }

  if (isLoading) {
    return (
      <Card className="w-full bg-black/20 backdrop-blur-lg border-white/20 text-white">
        <CardHeader><CardTitle>Haftalık Ders Programı</CardTitle></CardHeader>
        <CardContent className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card className="w-full overflow-hidden bg-black/20 backdrop-blur-lg border border-white/20 shadow-2xl shadow-black/50">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl text-white">
                <Sparkles className="h-5 w-5 text-yellow-300" /> Haftalık Ders Programı (Premium)
            </CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-4 overflow-x-auto no-scrollbar">
            <div className="grid grid-cols-5 gap-1 md:gap-2 min-w-[700px] md:min-w-full">
                {/* Day Headers */}
                {dayOrder.map(day => (
                    <div key={day} className="text-center font-bold text-white p-2 rounded-t-lg bg-gradient-to-b from-white/30 to-white/10 border-b border-white/20">
                       {dayAbbreviations[day]}
                    </div>
                ))}
                
                {/* Lesson Slots */}
                {Array.from({ length: totalSlots }).map((_, slotIndex) => (
                    <React.Fragment key={slotIndex}>
                        {dayOrder.map(day => {
                            const lesson = getLessonForSlot(day, slotIndex);
                            const bgColor = lesson ? stringToColor(lesson.subject) : 'transparent';
                            const neonColor = lesson ? stringToColor(lesson.subject) : '#a9a9a9';

                            return (
                                <div 
                                    key={`${day}-${slotIndex}`}
                                    onClick={() => setEditingLesson({ day, lessonSlot: slotIndex, lesson: lesson || null })}
                                    className="h-20 md:h-24 flex flex-col justify-center items-center rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105"
                                    style={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                        boxShadow: `0 0 2px ${neonColor}, 0 0 5px ${neonColor}, 0 0 10px ${neonColor}`,
                                        border: `1px solid ${neonColor}`,
                                    }}
                                >
                                    {lesson ? (
                                        <div className='text-center p-1'>
                                            <p 
                                                className="font-bold text-white text-sm md:text-base"
                                                style={{ textShadow: '0 0 5px #fff, 0 0 10px #fff' }}
                                            >{lesson.subject}</p>
                                            <p 
                                                className="text-xs text-gray-200"
                                                style={{ textShadow: '0 0 3px #000' }}
                                            >{lesson.class}</p>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-xs">Boş</span>
                                    )}
                                </div>
                            )
                        })}
                    </React.Fragment>
                ))}
            </div>
        </CardContent>
    </Card>
    {editingLesson && (
        <AddLessonForm
            isOpen={!!editingLesson}
            onClose={() => setEditingLesson(null)}
            day={editingLesson.day}
            lessonSlot={editingLesson.lessonSlot}
            lesson={editingLesson.lesson}
            onSave={handleLessonSave}
            onClear={handleClearLesson}
        />
    )}
    </>
  );
}
