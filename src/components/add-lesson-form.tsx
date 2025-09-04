
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
import { Day, Lesson, Plan } from '@/lib/types';
import { BookOpen, Trash2 } from 'lucide-react';

const gradeLevels = ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf", "5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf", "9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf", "Okul Öncesi"];

const formSchema = z.object({
  subject: z.string().min(2, { message: 'Ders adı en az 2 karakter olmalıdır.' }),
  class: z.string().min(1, { message: 'Sınıf şubesi en az 1 karakter olmalıdır.' }),
  grade: z.string({ required_error: 'Lütfen bir sınıf seviyesi seçin.' }),
});

type AddLessonFormProps = {
  isOpen: boolean;
  onClose: () => void;
  day: Day;
  lessonSlot: number;
  lesson: Lesson | null;
  onSave: (day: Day, lessonSlot: number, lessonData: Omit<Lesson, 'id'|'lessonSlot'>) => void;
  onClear: (day: Day, lessonSlot: number) => void;
  timeSlot: string;
  relatedPlan: Plan | null;
  onViewPlan: (plan: Plan) => void;
};

export function AddLessonForm({ isOpen, onClose, day, lessonSlot, lesson, onSave, onClear, timeSlot, relatedPlan, onViewPlan }: AddLessonFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: lesson?.subject || '',
      class: lesson?.class || '',
      grade: lesson?.grade || '',
    },
  });
  
  React.useEffect(() => {
    form.reset({
      subject: lesson?.subject || '',
      class: lesson?.class || '',
      grade: lesson?.grade || '',
    })
  }, [lesson, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(day, lessonSlot, { ...values, time: timeSlot.split(' - ')[0] });
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{lesson?.subject ? 'Dersi Düzenle' : 'Yeni Ders Ekle'}</DialogTitle>
          <DialogDescription>
            {day} günü, {timeSlot} saati için bilgileri girin.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ders Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: Matematik" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sınıf Seviyesi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seviye seçin..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {gradeLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şube</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormDescription>
                Dersin sınıf seviyesini belirtmek, ilgili yıllık planın otomatik olarak bulunmasını sağlar.
             </FormDescription>

            <DialogFooter className='sm:justify-between pt-4 gap-2'>
                <div className='flex gap-2'>
                {lesson && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive">
                                <Trash2 className='mr-2 h-4 w-4' /> Dersi Temizle
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bu işlem geri alınamaz. Bu ders programdan kalıcı olarak kaldırılacaktır.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => { onClear(day, lessonSlot); onClose(); }} className='bg-destructive hover:bg-destructive/90'>
                                    Evet, Sil
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
                {relatedPlan && (
                    <Button type='button' variant='outline' onClick={() => onViewPlan(relatedPlan)}>
                        <BookOpen className='mr-2 h-4 w-4' /> Yıllık Planı Gör
                    </Button>
                )}
                </div>
                <div className='flex gap-2'>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">İptal</Button>
                    </DialogClose>
                    <Button type="submit">Dersi Kaydet</Button>
                </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
