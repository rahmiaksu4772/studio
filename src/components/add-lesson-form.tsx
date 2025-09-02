'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Day, Lesson } from '@/lib/types';
import { Trash2 } from 'lucide-react';

const formSchema = z.object({
  subject: z.string().min(2, { message: 'Ders adı en az 2 karakter olmalıdır.' }),
  class: z.string().min(1, { message: 'Sınıf şubesi en az 1 karakter olmalıdır.' }),
  grade: z.string().min(1, { message: 'Sınıf seviyesi belirtilmelidir.' }),
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
};

export function AddLessonForm({ isOpen, onClose, day, lessonSlot, lesson, onSave, onClear, timeSlot }: AddLessonFormProps) {
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
                    <FormControl>
                      <Input placeholder="Örn: 8. Sınıf" {...field} />
                    </FormControl>
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
                <div>
                {lesson && (
                    <Button type="button" variant="destructive" onClick={() => { onClear(day, lessonSlot); onClose(); }}>
                        <Trash2 className='mr-2 h-4 w-4' /> Dersi Temizle
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
