'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Calendar, Clock, Settings, Plus } from 'lucide-react';
import type { Lesson, Day, WeeklyScheduleItem, ScheduleSettings } from '@/lib/types';
import { useWeeklySchedule } from '@/hooks/use-weekly-schedule';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { AddLessonForm } from './add-lesson-form';
import stringToColor from 'string-to-color';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

const dayOrder: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
const dayShort: { [key in Day]: string } = {
    'Pazartesi': 'P',
    'Salı': 'S',
    'Çarşamba': 'Ç',
    'Perşembe': 'P',
    'Cuma': 'C',
    'Cumartesi': 'C',
    'Pazar': 'P',
};

const calculateEndTime = (startTime: string, duration: number): string => {
    if (!startTime || !duration) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return '';
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
  const [selectedDay, setSelectedDay] = React.useState<Day>('Pazartesi');

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  // Set selected day to today if it's a weekday
  React.useEffect(() => {
    const todayIndex = new Date().getDay() - 1; // Monday = 0, ..., Friday = 4
    if (todayIndex >= 0 && todayIndex < 5) {
        setSelectedDay(dayOrder[todayIndex]);
    }
  }, []);

  const handleLessonSave = async (day: Day, lessonSlot: number, lessonData: Omit<Lesson, 'id'|'lessonSlot'>) => {
    if (!user) return;
    const lessonToSave: Lesson = {
        id: editingLesson?.lesson?.id || `${day}-${lessonSlot}-${new Date().getTime()}`,
        lessonSlot: lessonSlot,
        ...lessonData,
        time: settings.timeSlots[lessonSlot] || ''
    };
    
    await updateLesson(day, lessonToSave);
    toast({ title: "Ders Kaydedildi!", description: `${lessonData.subject} dersi programa eklendi.` });
    setEditingLesson(null);
  };
  
  const handleClearLesson = async (day: Day, lessonSlot: number) => {
     if (!user) return;
     await updateLesson(day, null, lessonSlot);
     toast({ title: "Ders Temizlendi!", variant: 'destructive' });
     setEditingLesson(null);
  }

  const handleSettingsChange = (field: keyof ScheduleSettings, value: string[] | number | string, index?: number) => {
    setLocalSettings(prev => {
        if (field === 'timeSlots' && Array.isArray(value) && index !== undefined) {
            const newTimeSlots = [...prev.timeSlots];
            newTimeSlots[index] = String(value);
            return {...prev, timeSlots: newTimeSlots};
        }
        if(field === 'timeSlots' && typeof value === 'string' && index !== undefined){
             const newTimeSlots = [...prev.timeSlots];
            newTimeSlots[index] = value;
            return {...prev, timeSlots: newTimeSlots};
        }
        return { ...prev, [field]: value };
    });
  };
  
  const handleTimeSlotChange = (index: number, value: string) => {
      const newTimeSlots = [...localSettings.timeSlots];
      newTimeSlots[index] = value;
      setLocalSettings(prev => ({ ...prev, timeSlots: newTimeSlots }));
  };
  
  const handleAddNewTimeSlot = () => {
       const newTimeSlots = [...localSettings.timeSlots, '16:00'];
       handleSettingsBlur('timeSlots', newTimeSlots);
  }

  const handleSettingsBlur = async (field: keyof ScheduleSettings, value?: any) => {
    if (!user) return;
    const valueToUpdate = value ?? localSettings[field];

    if (JSON.stringify(valueToUpdate) !== JSON.stringify(settings[field])) {
        await updateSettings({ [field]: valueToUpdate });
        toast({ title: 'Ayarlar Güncellendi' });
    }
  };

  const getLessonForSlot = (day: Day, slot: number): Lesson | undefined => {
    const daySchedule = schedule.find(d => d.day === day);
    return daySchedule?.lessons.find(l => l.lessonSlot === slot);
  }
  
  const selectedDaySchedule = React.useMemo(() => {
      return schedule.find(d => d.day === selectedDay);
  }, [schedule, selectedDay]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader><CardTitle>Haftalık Ders Programı</CardTitle></CardHeader>
        <CardContent className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <Card className="w-full overflow-hidden shadow-lg bg-card/80 backdrop-blur-lg">
          <CardHeader className='pb-4'>
              <CardTitle className="flex items-center justify-between text-lg md:text-xl">
                 <div className='flex items-center gap-2'>
                    <Calendar className="h-5 w-5 text-primary" /> Haftalık Ders Programı
                 </div>
              </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
             <div className='flex items-center justify-center gap-2 md:gap-4 mb-4'>
                {dayOrder.map(day => {
                    const color = stringToColor(day);
                    return (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={cn(
                                'flex-1 md:flex-none md:w-12 h-12 rounded-full text-lg font-bold transition-all duration-300 flex items-center justify-center',
                                selectedDay === day 
                                    ? 'text-white shadow-lg' 
                                    : 'text-muted-foreground bg-muted hover:bg-muted/80'
                            )}
                            style={{ backgroundColor: selectedDay === day ? color : undefined }}
                        >
                            {dayShort[day]}
                        </button>
                    )
                })}
             </div>
             
             <Separator/>

            <div className='mt-4'>
                <div 
                    className='p-2 rounded-lg font-bold text-center text-lg text-white mb-4'
                    style={{ backgroundColor: stringToColor(selectedDay) }}
                >
                    {selectedDay}
                </div>
                <div className='space-y-2'>
                    {localSettings.timeSlots.map((time, slotIndex) => {
                        const lesson = getLessonForSlot(selectedDay, slotIndex);
                        const lessonColor = lesson ? stringToColor(lesson.subject) : null;
                        
                        return(
                            <button
                                key={`slot-${slotIndex}`}
                                onClick={() => setEditingLesson({ day: selectedDay, lessonSlot: slotIndex, lesson: lesson || null })}
                                className={cn(
                                    'w-full p-3 rounded-lg flex items-center gap-4 transition-all duration-200 border text-left',
                                    lesson ? 'shadow-sm' : 'bg-muted/50 hover:bg-muted'
                                )}
                                style={{
                                    backgroundColor: lesson ? `${lessonColor}20` : undefined,
                                    borderColor: lesson ? `${lessonColor}40` : undefined
                                }}
                            >
                                <div className='flex flex-col items-center justify-center w-20'>
                                    <p className='font-semibold text-sm'>{time}</p>
                                    <p className='text-xs text-muted-foreground'>{calculateEndTime(time, settings.lessonDuration)}</p>
                                </div>
                                <div className='border-l h-8' style={{borderColor: lesson ? `${lessonColor}40` : undefined}}></div>
                                <div className='flex-1'>
                                    {lesson ? (
                                        <>
                                            <p className='font-bold text-sm'>{lesson.subject}</p>
                                            <p className='text-xs text-muted-foreground'>{lesson.class}</p>
                                        </>
                                    ) : (
                                         <p className='text-sm text-muted-foreground'>Ders eklemek için tıklayın...</p>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
          </CardContent>
      </Card>
      
       <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Settings className='h-4 w-4'/>
                    Program Ayarları
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                 <div className='space-y-2'>
                    <Label htmlFor="lessonDuration" className='flex-shrink-0'>Ders Süresi (Dakika)</Label>
                    <Input
                        id="lessonDuration"
                        type="number"
                        value={localSettings.lessonDuration || 40}
                        onChange={(e) => handleSettingsChange('lessonDuration', parseInt(e.target.value) || 0)}
                        onBlur={() => handleSettingsBlur('lessonDuration')}
                        className="w-full"
                    />
                </div>
                <div className='space-y-2'>
                    <Label>Ders Saatleri</Label>
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'>
                    {localSettings.timeSlots.map((time, index) => (
                        <Input
                            key={index}
                            type="time"
                            value={time}
                            onChange={(e) => handleTimeSlotChange(index, e.target.value)}
                            onBlur={() => handleSettingsBlur('timeSlots')}
                            className="w-full"
                        />
                    ))}
                     <Button variant='outline' onClick={handleAddNewTimeSlot} className='flex items-center gap-2'>
                        <Plus className='h-4 w-4'/> Yeni Saat Ekle
                    </Button>
                    </div>
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
              timeSlot={`${settings.timeSlots[editingLesson.lessonSlot]} - ${calculateEndTime(settings.timeSlots[editingLesson.lessonSlot], settings.lessonDuration)}` || ''}
          />
      )}
    </div>
  );
}
