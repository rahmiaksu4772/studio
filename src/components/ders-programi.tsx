
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck, Trash2, Plus, Loader2, Settings, Pencil, Clock, Calendar, Salad, Check, X } from 'lucide-react';
import type { Lesson, Day, WeeklyScheduleItem, DaySchedule } from '@/lib/types';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { addMinutes, format as formatDate, parse } from 'date-fns';

const dayOrder: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const dayAbbreviations: Record<Day, string> = { 'Pazartesi': 'P', 'Salı': 'S', 'Çarşamba': 'Ç', 'Perşembe': 'P', 'Cuma': 'C', 'Cumartesi': 'C', 'Pazar': 'P' };
const dayColors = ['bg-orange-400 hover:bg-orange-500', 'bg-sky-400 hover:bg-sky-500', 'bg-rose-400 hover:bg-rose-500', 'bg-yellow-400 hover:bg-yellow-500', 'bg-purple-400 hover:bg-purple-500', 'bg-slate-400 hover:bg-slate-500', 'bg-gray-400 hover:bg-gray-500'];

const scheduleSettingsSchema = z.object({
  schoolStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Geçerli bir saat formatı girin (HH:mm).' }),
  schoolEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Geçerli bir saat formatı girin (HH:mm).' }),
  lessonDuration: z.coerce.number().min(1, { message: 'Ders süresi en az 1 dakika olmalıdır.' }),
  breakDuration: z.coerce.number().min(0, { message: 'Teneffüs süresi 0 veya daha fazla olmalıdır.' }),
  lunchStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Geçerli bir saat formatı girin (HH:mm).' }),
  lunchEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Geçerli bir saat formatı girin (HH:mm).' }),
  lunchIsActive: z.boolean(),
}).refine(data => data.schoolStartTime < data.schoolEndTime, { message: 'Bitiş saati başlangıç saatinden sonra olmalıdır.', path: ['schoolEndTime'] })
  .refine(data => !data.lunchIsActive || (data.lunchStartTime < data.lunchEndTime), { message: 'Öğle tatili bitişi başlangıcından sonra olmalıdır.', path: ['lunchEndTime'] });

type ScheduleSettingsValues = z.infer<typeof scheduleSettingsSchema>;

const DayScheduleSettings = ({ day, daySchedule, onUpdate }: { day: Day, daySchedule: DaySchedule, onUpdate: (newSchedule: DaySchedule) => void }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const form = useForm<ScheduleSettingsValues>({
    resolver: zodResolver(scheduleSettingsSchema),
    defaultValues: daySchedule,
  });

  const { watch, setValue } = form;
  const lunchStart = watch("lunchStartTime");
  const lunchEnd = watch("lunchEndTime");

  React.useEffect(() => {
    form.reset(daySchedule);
  }, [daySchedule, form]);

  const onSubmit = (values: ScheduleSettingsValues) => {
    onUpdate({ ...daySchedule, ...values });
    setIsOpen(false);
  };

  const lunchDuration = React.useMemo(() => {
    if (!lunchStart || !lunchEnd) return 0;
    const start = parse(lunchStart, 'HH:mm', new Date());
    const end = parse(lunchEnd, 'HH:mm', new Date());
    if (end <= start) return 0;
    return (end.getTime() - start.getTime()) / (1000 * 60);
  }, [lunchStart, lunchEnd]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Settings className="mr-2 h-4 w-4" /> Zamanlamayı Ayarla</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{day} Günü Zamanlama Ayarları</DialogTitle>
          <DialogDescription>Ders saatlerini, teneffüsleri ve öğle tatilini bu gün için özelleştirin.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="schoolStartTime" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Okul Başlangıç Saati</FormLabel>
                            <FormControl><Input type="time" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="schoolEndTime" render={({ field }) => (
                         <FormItem>
                            <FormLabel>Okul Bitiş Saati</FormLabel>
                            <FormControl><Input type="time" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="lessonDuration" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ders Süresi (dk)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="breakDuration" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Teneffüs Süresi (dk)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <div className="space-y-2 rounded-lg border p-4">
                    <FormField control={form.control} name="lunchIsActive" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                             <FormLabel className="flex items-center gap-2 font-semibold text-base"><Salad/> Öğle Tatili</FormLabel>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                     )} />
                     <div className="grid grid-cols-2 gap-4 pt-2">
                        <FormField control={form.control} name="lunchStartTime" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Başlangıç</FormLabel>
                                <FormControl><Input type="time" {...field} disabled={!watch('lunchIsActive')} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="lunchEndTime" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bitiş</FormLabel>
                                <FormControl><Input type="time" {...field} disabled={!watch('lunchIsActive')} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div>
                             <Label>Süre (dk)</Label>
                             <Input value={lunchDuration} disabled className='font-bold mt-2' />
                        </div>
                     </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">İptal</Button></DialogClose>
                    <Button type="submit">Ayarları Kaydet</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


export default function DersProgrami() {
  const { user } = useAuth();
  const { schedule, isLoading, setDaySchedule } = useWeeklySchedule(user?.uid);
  const { toast } = useToast();
  const [editingLesson, setEditingLesson] = React.useState<{ day: Day, lesson: Lesson } | null>(null);

  const handleUpdateSchedule = (day: Day, newSchedule: DaySchedule) => {
    const existingLessons = schedule.find(s => s.day === day)?.schedule.lessons || [];
    setDaySchedule(day, { ...newSchedule, lessons: existingLessons });
  };

  const handleLessonSave = (day: Day, lessonData: Omit<Lesson, 'id'>) => {
    const daySchedule = schedule.find(s => s.day === day);
    if (!daySchedule) return;

    let updatedLessons: Lesson[];
    if (editingLesson) {
        // Update existing lesson
        updatedLessons = daySchedule.schedule.lessons.map(l => l.id === editingLesson.lesson.id ? { ...l, ...lessonData } : l);
        toast({ title: "Ders Güncellendi!" });
    } else {
        // Add new lesson
        const newLesson: Lesson = { ...lessonData, id: new Date().toISOString() + Math.random() };
        updatedLessons = [...daySchedule.schedule.lessons, newLesson];
        toast({ title: "Ders Eklendi!" });
    }
    
    setDaySchedule(day, { ...daySchedule.schedule, lessons: updatedLessons });
    setEditingLesson(null);
  };

  const handleDeleteLesson = (day: Day, lessonId: string) => {
    const daySchedule = schedule.find(s => s.day === day);
    if (!daySchedule) return;

    const updatedLessons = daySchedule.schedule.lessons.filter(l => l.id !== lessonId);
    setDaySchedule(day, { ...daySchedule.schedule, lessons: updatedLessons });
    toast({ title: "Ders Silindi!", variant: 'destructive'});
  }
  
  const generateLessonSlots = (daySchedule: DaySchedule) => {
    const slots = [];
    let currentTime = parse(daySchedule.schoolStartTime, 'HH:mm', new Date());
    const endTime = parse(daySchedule.schoolEndTime, 'HH:mm', new Date());
    const lunchStart = parse(daySchedule.lunchStartTime, 'HH:mm', new Date());
    const lunchEnd = parse(daySchedule.lunchEndTime, 'HH:mm', new Date());

    let lessonCount = 0;
    while (currentTime < endTime && lessonCount < 8) {
        const lessonStartTime = currentTime;
        
        // Handle Lunch Break
        if (daySchedule.lunchIsActive && lessonStartTime >= lunchStart && lessonStartTime < lunchEnd) {
            currentTime = lunchEnd;
            continue; // Skip to next iteration after lunch
        }

        const lessonEndTime = addMinutes(lessonStartTime, daySchedule.lessonDuration);
        
        if (lessonEndTime > endTime) break;

        const timeString = `${formatDate(lessonStartTime, 'HH:mm')}-${formatDate(lessonEndTime, 'HH:mm')}`;
        slots.push({ time: timeString, id: `slot-${lessonCount}-${timeString}` });

        currentTime = addMinutes(lessonEndTime, daySchedule.breakDuration);
        lessonCount++;
    }
    return slots;
};

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader><CardTitle>Haftalık Ders Programı</CardTitle></CardHeader>
        <CardContent className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <BookOpenCheck className="h-5 w-5" /> Haftalık Ders Programı
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="Pazartesi" className="w-full">
          <TabsList className="grid w-full grid-cols-7 gap-2 bg-transparent p-0">
            {dayOrder.map((day, index) => (
              <TabsTrigger key={day} value={day} className={`text-white font-bold data-[state=active]:ring-2 data-[state=active]:ring-primary data-[state=active]:ring-offset-2 transition-all duration-200 ${dayColors[index]}`}>
                {dayAbbreviations[day]}
              </TabsTrigger>
            ))}
          </TabsList>
          {dayOrder.map((day, index) => {
            const dayItem = schedule.find(s => s.day === day);
            if (!dayItem) return <TabsContent key={day} value={day} className="space-y-4 mt-4">Gün verisi bulunamadı.</TabsContent>;
            
            const { schedule: daySchedule } = dayItem;
            const lessonSlots = generateLessonSlots(daySchedule);

            return (
              <TabsContent key={day} value={day} className="space-y-4 mt-4">
                <div className="flex justify-between items-center p-3 rounded-md text-white font-bold text-lg bg-gradient-to-r from-primary to-primary/70">
                  <span>{day}</span>
                  <DayScheduleSettings day={day} daySchedule={daySchedule} onUpdate={(newSchedule) => handleUpdateSchedule(day, newSchedule)} />
                </div>
                <div className="border rounded-md">
                  <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center p-2 text-sm font-bold bg-muted">
                    <div className="px-2">Saat</div>
                    <div>Ders Adı</div>
                    <div>Sınıf</div>
                    <div className='text-center'>İşlem</div>
                  </div>
                  <ul className="divide-y divide-border">
                   {lessonSlots.length > 0 ? lessonSlots.map((slot, lessonIndex) => {
                        const lesson = daySchedule.lessons.find(l => l.time === slot.time);
                        return (
                             <li key={slot.id} className="grid grid-cols-[auto_1fr_1fr_auto] items-center p-3 hover:bg-muted/50 gap-2 min-h-[60px]">
                                <div className='font-mono text-sm px-2'>{slot.time}</div>
                                {lesson ? (
                                    <>
                                        <div className='font-medium'>{lesson.subject}</div>
                                        <div className='text-muted-foreground'>{lesson.class}</div>
                                        <div className='flex items-center gap-1 justify-end'>
                                            <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => setEditingLesson({ day, lesson })}>
                                                <Pencil className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className='h-8 w-8'><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Dersi Sil</AlertDialogTitle><AlertDialogDescription>"{lesson.subject}" dersini silmek istediğinize emin misiniz?</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter><AlertDialogCancel>İptal</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteLesson(day, lesson.id)}>Evet, Sil</AlertDialogAction></AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className='text-muted-foreground italic col-span-2'>Boş</div>
                                        <div className="flex justify-end">
                                            <Button variant="outline" size="sm" onClick={() => setEditingLesson({ day, lesson: { id: '', time: slot.time, subject: '', class: '' } })}>
                                                <Plus className='h-4 w-4 mr-1'/> Ekle
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </li>
                        )
                   }) : <li className='text-center p-8 text-muted-foreground'>Bu gün için ders yuvası oluşturulamadı. Lütfen zamanlama ayarlarını kontrol edin.</li>}
                  </ul>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
        {editingLesson && (
            <AddLessonForm 
                isOpen={!!editingLesson}
                onClose={() => setEditingLesson(null)}
                day={editingLesson.day}
                lesson={editingLesson.lesson}
                onSave={handleLessonSave}
            />
        )}
      </CardContent>
    </Card>
  );
}
