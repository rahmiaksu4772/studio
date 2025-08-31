
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Calendar, Clock } from 'lucide-react';
import type { Lesson, Day, WeeklyScheduleItem, ScheduleSettings } from '@/lib/types';
import { useWeeklySchedule } from '@/hooks/use-weekly-schedule';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { AddLessonForm } from './add-lesson-form';
import stringToColor from 'string-to-color';
import { Input } from './ui/input';
import { Label } from './ui/label';

const dayOrder: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

const calculateEndTime = (startTime: string, duration: number): string => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
};


export default function DersProgrami() {
  const { user } = useAuth();
  const { schedule, isLoading, updateLesson, updateSettings, settings } = useWeeklySchedule(user?.uid);
  const { toast } = useToast();
  
  const [editingLesson, setEditingLesson] = React.useState<{ day: Day, lessonSlot: number, lesson: Lesson | null } | null>(null);
  const [localSettings, setLocalSettings] = React.useState<ScheduleSettings>(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleLessonSave = async (day: Day, lessonSlot: number, lessonData: Omit<Lesson, 'id'|'lessonSlot'>) => {
    const lessonToSave: Lesson = {
        id: editingLesson?.lesson?.id || `${day}-${lessonSlot}-${new Date().getTime()}`,
        lessonSlot: lessonSlot,
        ...lessonData
    };
    
    await updateLesson(day, lessonToSave);
    toast({ title: "Ders Kaydedildi!", description: `${lessonData.subject} dersi programa eklendi.` });
    setEditingLesson(null);
  };
  
  const handleClearLesson = async (day: Day, lessonSlot: number) => {
     await updateLesson(day, null, lessonSlot);
     toast({ title: "Ders Temizlendi!", variant: 'destructive' });
     setEditingLesson(null);
  }

  const handleSettingsChange = (field: keyof ScheduleSettings, value: string | number) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsBlur = async () => {
    // Check for actual changes before updating
    if (JSON.stringify(localSettings) !== JSON.stringify(settings)) {
        await updateSettings(localSettings);
        toast({ title: 'Ayarlar Güncellendi' });
    }
  };

  const getLessonForSlot = (day: Day, slot: number): Lesson | undefined => {
    const daySchedule = schedule.find(d => d.day === day);
    return daySchedule?.lessons.find(l => l.lessonSlot === slot);
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader><CardTitle>Haftalık Ders Programı</CardTitle></CardHeader>
        <CardContent className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full overflow-hidden shadow-lg">
          <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Calendar className="h-5 w-5 text-primary" /> Haftalık Ders Programı
              </CardTitle>
              <CardDescription className='flex flex-col sm:flex-row items-center gap-2 sm:gap-4 pt-2'>
                <div className='flex items-center gap-2'>
                    <Label htmlFor="lessonDuration" className='flex-shrink-0'>Ders Süresi (dk):</Label>
                    <Input
                        id="lessonDuration"
                        type="number"
                        value={localSettings.lessonDuration}
                        onChange={(e) => handleSettingsChange('lessonDuration', parseInt(e.target.value) || 0)}
                        onBlur={handleSettingsBlur}
                        className="w-20"
                    />
                </div>
              </CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-4 overflow-x-auto no-scrollbar">
              <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-1 md:gap-2 min-w-[700px] md:min-w-full">
                  {/* Time Header */}
                  <div className="text-center font-bold p-2 rounded-t-lg bg-muted flex items-center justify-center gap-2">
                    <Clock className='h-4 w-4'/>
                    <span className='hidden md:inline'>Saat</span>
                  </div>
                  {/* Day Headers */}
                  {dayOrder.map(day => (
                      <div key={day} className="text-center font-bold text-card-foreground p-2 rounded-t-lg bg-muted">
                        <span className='hidden md:inline'>{day}</span>
                        <span className='md:hidden'>{day.substring(0,3)}</span>
                      </div>
                  ))}
                  
                  {/* Rows */}
                  {localSettings.timeSlots.map((time, slotIndex) => (
                      <React.Fragment key={slotIndex}>
                          {/* Time Slot Cell */}
                          <div className="h-20 md:h-24 flex flex-col justify-center items-center rounded-lg bg-muted/50 p-1">
                               <Input
                                type="time"
                                value={time}
                                onChange={(e) => {
                                    const newTimeSlots = [...localSettings.timeSlots];
                                    newTimeSlots[slotIndex] = e.target.value;
                                    setLocalSettings(prev => ({...prev, timeSlots: newTimeSlots}));
                                }}
                                onBlur={handleSettingsBlur}
                                className="w-24 text-center bg-transparent border-none focus-visible:ring-1 focus-visible:ring-ring mb-1"
                              />
                              <div className='text-xs text-muted-foreground'>
                                  {calculateEndTime(time, localSettings.lessonDuration)}
                              </div>
                          </div>

                          {/* Lesson Cells */}
                          {dayOrder.map(day => {
                              const lesson = getLessonForSlot(day, slotIndex);
                              const color = lesson ? stringToColor(lesson.subject) : '#808080';
                              
                              return (
                                  <div 
                                      key={`${day}-${slotIndex}`}
                                      onClick={() => setEditingLesson({ day, lessonSlot: slotIndex, lesson: lesson || null })}
                                      className="h-20 md:h-24 flex flex-col justify-center items-center rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent hover:shadow-md border"
                                      style={{ 
                                          backgroundColor: lesson ? `${color}20` : 'transparent', // Semi-transparent background
                                          borderColor: lesson ? `${color}40` : 'hsl(var(--border))',
                                      }}
                                  >
                                      {lesson ? (
                                          <div className='text-center p-1'>
                                              <p className="font-bold text-sm md:text-base">{lesson.subject}</p>
                                              <p className="text-xs text-muted-foreground">{lesson.class}</p>
                                          </div>
                                      ) : (
                                          <span className="text-muted-foreground text-xs">Boş</span>
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
              timeSlot={`${localSettings.timeSlots[editingLesson.lessonSlot]} - ${calculateEndTime(localSettings.timeSlots[editingLesson.lessonSlot], localSettings.lessonDuration)}` || ''}
          />
      )}
    </>
  );
}
