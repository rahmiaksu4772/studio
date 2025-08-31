
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

const formSchema = z.object({
  subject: z.string().min(2, { message: 'Ders adı en az 2 karakter olmalıdır.' }),
  class: z.string().min(1, { message: 'Sınıf adı en az 1 karakter olmalıdır.' }),
});

type AddLessonFormProps = {
  isOpen: boolean;
  onClose: () => void;
  day: Day;
  lesson: Lesson | Omit<Lesson, 'id'>;
  onSave: (day: Day, lessonData: Omit<Lesson, 'id'>) => void;
};

export function AddLessonForm({ isOpen, onClose, day, lesson, onSave }: AddLessonFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: lesson.subject || '',
      class: lesson.class || '',
    },
  });
  
  React.useEffect(() => {
    form.reset({
      subject: lesson.subject || '',
      class: lesson.class || '',
    })
  }, [lesson, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(day, {
      ...values,
      time: lesson.time,
    });
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{lesson.subject ? 'Dersi Düzenle' : 'Yeni Ders Ekle'}</DialogTitle>
          <DialogDescription>
            {day} günü için {lesson.time} saatindeki dersin detaylarını girin.
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
            <FormField
              control={form.control}
              name="class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sınıf</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: 6/A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">İptal</Button>
                </DialogClose>
                <Button type="submit">Dersi Kaydet</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
