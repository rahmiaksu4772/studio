
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpenCheck, Trash2, Settings, Plus, Loader2, Save } from 'lucide-react';
import type { Lesson, Day, WeeklyScheduleItem, ScheduleSettings } from '@/lib/types';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addMinutes, format, differenceInMinutes, parse } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Switch } from './ui/switch';

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
    schoolStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Geçersiz saat formatı. "HH:mm" kullanın.' }),
    schoolEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Geçersiz saat formatı. "HH:mm" kullanın.' }),
    lessonDuration: z.coerce.number().min(1, 'Ders süresi en az 1 dakika olmalıdır.'),
    breakDuration: z.coerce.number().min(0, 'Teneffüs süresi 0 veya daha fazla olmalıdır.'),
    isLunchActive: z.boolean().default(true),
    lunchStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Geçersiz saat formatı. "HH:mm" kullanın.' }),
    lunchEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Geçersiz saat formatı. "HH:mm" kullanın.' }),
}).refine(data => {
    const start = parse(data.schoolStartTime, 'HH:mm', new Date());
    const end = parse(data.schoolEndTime, 'HH:mm', new Date());
    return end > start;
}, { message: "Bitiş saati, başlangıç saatinden sonra olmalıdır.", path: ["schoolEndTime"] })
.refine(data => {
    if (!data.isLunchActive) return true;
    const start = parse(data.lunchStartTime, 'HH:mm', new Date());
    const end = parse(data.lunchEndTime, 'HH:mm', new Date());
    return end > start;
}, { message: "Öğle tatili bitişi, başlangıcından sonra olmalıdır.", path: ["lunchEndTime"] });


const lessonSchema = z.object({
  subject: z.string().min(2, { message: 'Ders adı en az 2 karakter olmalıdır.' }),
  class: z.string().min(1, { message: 'Sınıf adı en az 1 karakter olmalıdır.' }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;
type LessonFormValues = z.infer<typeof lessonSchema>;

function DayScheduleSettings({ day, onSave, settings }: { day: WeeklyScheduleItem, onSave: (data: ScheduleSettings) => void, settings: ScheduleSettings }) {
    const [open, setOpen] = React.useState(false);
    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: settings
    });

    const watchLunchStart = form.watch("lunchStartTime");
    const watchLunchEnd = form.watch("lunchEndTime");
    
    const lunchDuration = React.useMemo(() => {
        try {
            const start = parse(watchLunchStart, 'HH:mm', new Date());
            const end = parse(watchLunchEnd, 'HH:mm', new Date());
            if (end > start) {
                return differenceInMinutes(end, start);
            }
            return 0;
        } catch {
            return 0;
        }
    }, [watchLunchStart, watchLunchEnd]);

    const onSubmit = (data: SettingsFormValues) => {
        onSave(data);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm"><Settings className="mr-2 h-4 w-4" /> Zamanlamayı Ayarla</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{day.day} Günü Zamanlama Ayarları</DialogTitle>
                    <DialogDescription>Ders ve teneffüs sürelerini belirleyerek programı otomatik oluşturun.</DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <FormField control={form.control} name="schoolStartTime" render={({ field }) => (
                            <div className='space-y-1'>
                                <Label htmlFor="schoolStartTime">Okul Başlangıç Saati</Label>
                                <Input id="schoolStartTime" type="time" {...field} />
                                {form.formState.errors.schoolStartTime && <p className="text-sm text-destructive mt-1">{form.formState.errors.schoolStartTime.message}</p>}
                            </div>
                         )} />
                          <FormField control={form.control} name="schoolEndTime" render={({ field }) => (
                            <div className='space-y-1'>
                                <Label htmlFor="schoolEndTime">Okul Bitiş Saati</Label>
                                <Input id="schoolEndTime" type="time" {...field} />
                                {form.formState.errors.schoolEndTime && <p className="text-sm text-destructive mt-1">{form.formState.errors.schoolEndTime.message}</p>}
                            </div>
                         )} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="lessonDuration" render={({ field }) => (
                            <div className='space-y-1'>
                                <Label htmlFor="lessonDuration">Ders Süresi (dk)</Label>
                                <Input id="lessonDuration" type="number" {...field} />
                                 {form.formState.errors.lessonDuration && <p className="text-sm text-destructive mt-1">{form.formState.errors.lessonDuration.message}</p>}
                            </div>
                        )} />
                        <FormField control={form.control} name="breakDuration" render={({ field }) => (
                            <div className='space-y-1'>
                                <Label htmlFor="breakDuration">Teneffüs Süresi (dk)</Label>
                                <Input id="breakDuration" type="number" {...field} />
                                {form.formState.errors.breakDuration && <p className="text-sm text-destructive mt-1">{form.formState.errors.breakDuration.message}</p>}
                            </div>
                        )} />
                    </div>

                    <div className="space-y-2 p-4 border rounded-md">
                         <FormField control={form.control} name="isLunchActive" render={({ field }) => (
                             <div className="flex items-center justify-between">
                                <Label htmlFor="isLunchActive" className="font-semibold">Öğle Tatili Aktif</Label>
                                <Switch id="isLunchActive" checked={field.value} onCheckedChange={field.onChange} />
                             </div>
                         )} />
                        {form.watch('isLunchActive') && (
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <FormField control={form.control} name="lunchStartTime" render={({ field }) => (
                                    <div className='space-y-1'>
                                        <Label htmlFor="lunchStartTime">Öğle Tatili Başlangıç</Label>
                                        <Input id="lunchStartTime" type="time" {...field} />
                                        {form.formState.errors.lunchStartTime && <p className="text-sm text-destructive mt-1">{form.formState.errors.lunchStartTime.message}</p>}
                                    </div>
                                )} />
                                <FormField control={form.control} name="lunchEndTime" render={({ field }) => (
                                    <div className='space-y-1'>
                                        <Label htmlFor="lunchEndTime">Öğle Tatili Bitiş</Label>
                                        <Input id="lunchEndTime" type="time" {...field} />
                                        {form.formState.errors.lunchEndTime && <p className="text-sm text-destructive mt-1">{form.formState.errors.lunchEndTime.message}</p>}
                                    </div>
                                )} />
                                 <div className='space-y-1 col-span-2'>
                                    <Label>Öğle Tatili Süresi (dk)</Label>
                                    <Input value={lunchDuration} disabled className="bg-muted" />
                                    <p className="text-xs text-muted-foreground">Otomatik hesaplanır</p>
                                </div>
                            </div>
                        )}
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
  const { schedule, setScheduleForDay, isLoading } = useWeeklySchedule(user?.uid);
  const { toast } = useToast();

  const handleSaveSettings = (day: Day, settings: ScheduleSettings) => {
      const { 
          schoolStartTime, schoolEndTime, lessonDuration, breakDuration,
          isLunchActive, lunchStartTime, lunchEndTime
      } = settings;
      
      const newLessons: Lesson[] = [];
      let lessonCounter = 1;
      let currentTime = parse(schoolStartTime, 'HH:mm', new Date());
      const schoolEnd = parse(schoolEndTime, 'HH:mm', new Date());
      const lunchStart = isLunchActive ? parse(lunchStartTime, 'HH:mm', new Date()) : null;
      const lunchEnd = isLunchActive ? parse(lunchEndTime, 'HH:mm', new Date()) : null;
      
      const daySchedule = schedule.find(s => s.day === day);

      while (currentTime < schoolEnd) {
          const lessonStartTime = new Date(currentTime);
          
          if(lunchStart && lunchEnd && lessonStartTime >= lunchStart && lessonStartTime < lunchEnd) {
              currentTime = new Date(lunchEnd);
              continue;
          }

          const lessonEndTime = addMinutes(lessonStartTime, lessonDuration);

          if (lessonEndTime > schoolEnd) break;

          const existingLesson = daySchedule?.lessons.find(l => l.lessonNumber === lessonCounter);

          newLessons.push({
              id: existingLesson?.id || `${day}-${lessonCounter}-${new Date().toISOString()}`,
              lessonNumber: lessonCounter,
              time: `${format(lessonStartTime, 'HH:mm')} - ${format(lessonEndTime, 'HH:mm')}`,
              subject: existingLesson?.subject || '',
              class: existingLesson?.class || '',
          });

          currentTime = addMinutes(lessonEndTime, breakDuration);
          lessonCounter++;
      }
      
      setScheduleForDay(day, { ...settings, lessons: newLessons });
      toast({ title: "Program Güncellendi", description: `${day} günü için ders saatleri yeniden oluşturuldu.` });
  };

  const handleSaveLesson = (day: Day, lessonNumber: number, data: LessonFormValues) => {
      const daySchedule = schedule.find(d => d.day === day);
      if (!daySchedule) return;

      const updatedLessons = daySchedule.lessons.map(l => 
        l.lessonNumber === lessonNumber ? { ...l, ...data } : l
      );
      
      setScheduleForDay(day, { ...daySchedule, lessons: updatedLessons });
      toast({ title: "Ders Kaydedildi", description: `"${data.subject}" dersi programa eklendi.` });
  }

  const handleDeleteLesson = (day: Day, lessonNumber: number) => {
       const daySchedule = schedule.find(d => d.day === day);
      if (!daySchedule) return;
      
      const lessonToDelete = daySchedule.lessons.find(l => l.lessonNumber === lessonNumber);

      const updatedLessons = daySchedule.lessons.map(l => 
        l.lessonNumber === lessonNumber ? { ...l, subject: '', class: '' } : l
      );

      setScheduleForDay(day, { ...daySchedule, lessons: updatedLessons });
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
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            {dayOrder.map((day) => (
              <TabsTrigger key={day} value={day}>{dayAbbreviations[day]}</TabsTrigger>
            ))}
          </TabsList>
          {dayOrder.map((day) => {
            const daySchedule = schedule.find(s => s.day === day) || { day, lessons: [], schoolStartTime: '09:00', schoolEndTime: '17:00', lessonDuration: 40, breakDuration: 10, isLunchActive: true, lunchStartTime: '12:30', lunchEndTime: '13:30' };
            return (
              <TabsContent key={day} value={day} className="space-y-4">
                <div className="flex justify-between items-center bg-muted p-2 rounded-md">
                   <h3 className="font-semibold text-lg">{day}</h3>
                   <DayScheduleSettings 
                        day={daySchedule} 
                        onSave={(data) => handleSaveSettings(day, data)} 
                        settings={{
                            schoolStartTime: daySchedule.schoolStartTime,
                            schoolEndTime: daySchedule.schoolEndTime,
                            lessonDuration: daySchedule.lessonDuration,
                            breakDuration: daySchedule.breakDuration,
                            isLunchActive: daySchedule.isLunchActive,
                            lunchStartTime: daySchedule.lunchStartTime,
                            lunchEndTime: daySchedule.lunchEndTime,
                        }}
                    />
                </div>
                 {daySchedule.lessons.length > 0 ? (
                      <div className="border rounded-md">
                        <ul className="divide-y divide-border">
                        {daySchedule.lessons.sort((a, b) => a.lessonNumber - b.lessonNumber).map((lesson, index) => (
                           <li key={lesson.id} className="grid grid-cols-[auto_1fr_auto] items-center p-3 hover:bg-muted/50 gap-4">
                               <div className='flex items-center gap-3'>
                                   <span className="font-bold text-lg text-primary">{lesson.lessonNumber}.</span>
                                   <div className='flex flex-col'>
                                       <span className="font-semibold text-base">{lesson.subject || 'Boş Ders'}</span>
                                       <span className="text-sm text-muted-foreground">{lesson.class || 'Sınıf atanmamış'}</span>
                                   </div>
                               </div>
                               <div className="flex flex-col items-end text-right">
                                    <span className="text-sm font-mono">{lesson.time}</span>
                                    <div className='flex items-center mt-1'>
                                        <LessonEditor
                                            lesson={lesson}
                                            onSave={(data) => handleSaveLesson(day, lesson.lessonNumber, data)}
                                            triggerButton={
                                                <Button variant={lesson.subject ? "outline" : "default"} size="sm" className='h-8'>
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
