
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpenCheck, Trash2, Settings, Plus, Loader2, Save } from 'lucide-react';
import type { Lesson, Day, WeeklyScheduleItem } from '@/lib/types';
import { useWeeklySchedule } from '@/hooks/use-weekly-schedule';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addMinutes, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const dayOrder: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
const dayAbbreviations: Record<Day, string> = {
  'Pazartesi': 'PZT',
  'Salı': 'SAL',
  'Çarşamba': 'ÇAR',
  'Perşembe': 'PER',
  'Cuma': 'CUM',
  'Cumartesi': 'CMT',
  'Pazar': 'PAZ'
};

const settingsSchema = z.object({
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Lütfen "09:00" formatında girin.' }),
    lessonDuration: z.coerce.number().min(1, 'Ders süresi en az 1 dakika olmalıdır.'),
    breakDuration: z.coerce.number().min(0, 'Teneffüs süresi 0 veya daha fazla olmalıdır.'),
});

const lessonSchema = z.object({
  subject: z.string().min(2, { message: 'Ders adı en az 2 karakter olmalıdır.' }),
  class: z.string().min(1, { message: 'Sınıf adı en az 1 karakter olmalıdır.' }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;
type LessonFormValues = z.infer<typeof lessonSchema>;

function DayScheduleSettings({ day, onSave, settings }: { day: WeeklyScheduleItem, onSave: (data: SettingsFormValues) => void, settings: SettingsFormValues }) {
    const [open, setOpen] = React.useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: settings
    });

    const onSubmit = (data: SettingsFormValues) => {
        onSave(data);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm"><Settings className="mr-2 h-4 w-4" /> Zamanlamayı Ayarla</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{day.day} Günü Zamanlama Ayarları</DialogTitle>
                    <DialogDescription>Ders ve teneffüs sürelerini belirleyerek programı otomatik oluşturun.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="startTime">Başlangıç Saati</Label>
                        <Input id="startTime" {...register('startTime')} />
                        {errors.startTime && <p className="text-sm text-destructive mt-1">{errors.startTime.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="lessonDuration">Ders Süresi (dakika)</Label>
                        <Input id="lessonDuration" type="number" {...register('lessonDuration')} />
                        {errors.lessonDuration && <p className="text-sm text-destructive mt-1">{errors.lessonDuration.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="breakDuration">Teneffüs Süresi (dakika)</Label>
                        <Input id="breakDuration" type="number" {...register('breakDuration')} />
                         {errors.breakDuration && <p className="text-sm text-destructive mt-1">{errors.breakDuration.message}</p>}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">İptal</Button></DialogClose>
                        <Button type="submit">Kaydet ve Programı Oluştur</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function LessonEditor({ lesson, onSave, triggerButton }: { lesson: Partial<Lesson>, onSave: (data: LessonFormValues) => void, triggerButton: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<LessonFormValues>({
        resolver: zodResolver(lessonSchema),
        defaultValues: { subject: lesson.subject || '', class: lesson.class || '' }
    });

    const onSubmit = (data: LessonFormValues) => {
        onSave(data);
        setOpen(false);
    }

    return (
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{triggerButton}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ders Bilgilerini Düzenle</DialogTitle>
                    <DialogDescription>{lesson.time} saatindeki dersin bilgilerini girin.</DialogDescription>
                </DialogHeader>
                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="subject">Ders Adı</Label>
                        <Input id="subject" {...register('subject')} placeholder="Örn: Matematik" />
                        {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="class">Sınıf</Label>
                        <Input id="class" {...register('class')} placeholder="Örn: 8/A" />
                        {errors.class && <p className="text-sm text-destructive mt-1">{errors.class.message}</p>}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">İptal</Button></DialogClose>
                        <Button type="submit">Dersi Kaydet</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


export default function DersProgrami() {
  const { user } = useAuth();
  const { schedule, updateDaySchedule, isLoading } = useWeeklySchedule(user?.uid);
  const { toast } = useToast();

  const handleSaveSettings = (day: Day, data: SettingsFormValues) => {
      const { startTime, lessonDuration, breakDuration } = data;
      
      const newLessons: Lesson[] = [];
      let currentTime = new Date(`1970-01-01T${startTime}:00`);

      for (let i = 0; i < 8; i++) {
          const lessonStartTime = new Date(currentTime);
          const lessonEndTime = addMinutes(lessonStartTime, lessonDuration);
          
          const existingLesson = schedule.find(d => d.day === day)?.lessons.find(l => l.lessonNumber === i + 1);

          newLessons.push({
              id: existingLesson?.id || `${day}-${i+1}-${new Date().toISOString()}`,
              lessonNumber: i + 1,
              time: `${format(lessonStartTime, 'HH:mm')} - ${format(lessonEndTime, 'HH:mm')}`,
              subject: existingLesson?.subject || '',
              class: existingLesson?.class || '',
          });

          currentTime = addMinutes(lessonEndTime, breakDuration);
      }
      
      updateDaySchedule(day, { ...data, lessons: newLessons });
      toast({ title: "Program Güncellendi", description: `${day} günü için ders saatleri yeniden oluşturuldu.` });
  };

  const handleSaveLesson = (day: Day, lessonNumber: number, data: LessonFormValues) => {
      const daySchedule = schedule.find(d => d.day === day);
      if (!daySchedule) return;

      const updatedLessons = daySchedule.lessons.map(l => 
        l.lessonNumber === lessonNumber ? { ...l, ...data } : l
      );
      
      updateDaySchedule(day, { ...daySchedule, lessons: updatedLessons });
      toast({ title: "Ders Kaydedildi", description: `"${data.subject}" dersi programa eklendi.` });
  }

  const handleDeleteLesson = (day: Day, lessonNumber: number) => {
       const daySchedule = schedule.find(d => d.day === day);
      if (!daySchedule) return;
      
      const lessonToDelete = daySchedule.lessons.find(l => l.lessonNumber === lessonNumber);

      const updatedLessons = daySchedule.lessons.map(l => 
        l.lessonNumber === lessonNumber ? { ...l, subject: '', class: '' } : l
      );

      updateDaySchedule(day, { ...daySchedule, lessons: updatedLessons });
       toast({ title: "Ders Temizlendi", description: `"${lessonToDelete?.subject}" dersi programdan kaldırıldı.`, variant: 'destructive' });
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
        <CardDescription>
            Günleri seçin, zamanlamayı ayarlayın ve derslerinizi girin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="Pazartesi" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {dayOrder.map((day) => (
              <TabsTrigger key={day} value={day}>{dayAbbreviations[day]}</TabsTrigger>
            ))}
          </TabsList>
          {dayOrder.map((day) => {
            const daySchedule = schedule.find(s => s.day === day) || { day, lessons: [], startTime: '09:00', lessonDuration: 40, breakDuration: 10 };
            return (
              <TabsContent key={day} value={day} className="space-y-4">
                <div className="flex justify-between items-center bg-muted p-2 rounded-md">
                   <h3 className="font-semibold text-lg">{day}</h3>
                   <DayScheduleSettings 
                        day={daySchedule} 
                        onSave={(data) => handleSaveSettings(day, data)} 
                        settings={{
                            startTime: daySchedule.startTime,
                            lessonDuration: daySchedule.lessonDuration,
                            breakDuration: daySchedule.breakDuration
                        }}
                    />
                </div>
                 {daySchedule.lessons.length > 0 ? (
                      <div className="border rounded-md">
                        <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center p-2 font-medium text-muted-foreground border-b">
                            <span>#</span>
                            <span>Ders Adı</span>
                            <span>Sınıf</span>
                            <span className="text-center">Zaman</span>
                            <span className="w-8"></span>
                        </div>
                        <ul className="divide-y">
                        {daySchedule.lessons.sort((a, b) => a.lessonNumber - b.lessonNumber).map((lesson, index) => (
                           <li key={lesson.id} className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center p-2 hover:bg-muted/50">
                               <span>{lesson.lessonNumber}</span>
                               <span>{lesson.subject || '-'}</span>
                               <span>{lesson.class || '-'}</span>
                               <span className="text-center">{lesson.time}</span>
                               <div className="flex items-center">
                                    <LessonEditor
                                        lesson={lesson}
                                        onSave={(data) => handleSaveLesson(day, lesson.lessonNumber, data)}
                                        triggerButton={
                                            <Button variant={lesson.subject ? "outline" : "default"} size="sm">
                                                {lesson.subject ? 'Düzenle' : <><Plus className='h-4 w-4 mr-1'/> Ekle</>}
                                            </Button>
                                        }
                                    />
                                    {lesson.subject && (
                                         <Button variant="ghost" size="icon" className='h-8 w-8 ml-1' onClick={() => handleDeleteLesson(day, lesson.lessonNumber)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                               </div>
                           </li>
                        ))}
                        </ul>
                    </div>
                ) : (
                    <div className="text-center p-8 border-2 border-dashed rounded-md text-muted-foreground">
                        <p>Bu gün için program oluşturulmamış.</p>
                        <p className="text-sm">Başlamak için "Zamanlamayı Ayarla" butonunu kullanın.</p>
                    </div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
