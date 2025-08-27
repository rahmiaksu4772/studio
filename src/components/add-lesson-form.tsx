
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Day, Lesson } from '@/lib/types';

const formSchema = z.object({
  subject: z.string().min(2, { message: 'Ders adı en az 2 karakter olmalıdır.' }),
  class: z.string().min(2, { message: 'Sınıf adı en az 2 karakter olmalıdır.' }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s*-\s*([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Lütfen "09:00 - 09:40" formatında girin.' }),
});

type AddLessonFormProps = {
  day: Day;
  onAddLesson: (day: Day, lessonData: Omit<Lesson, 'id'>) => void;
};

export function AddLessonForm({ day, onAddLesson }: AddLessonFormProps) {
  const [open, setOpen] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      class: '',
      time: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddLesson(day, values);
    form.reset();
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Ders Ekle
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Yeni Ders Ekle</h4>
            <p className="text-sm text-muted-foreground">{day} günü için yeni bir ders oluşturun.</p>
          </div>
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
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ders Saati</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: 09:00 - 09:40" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Dersi Ekle</Button>
            </form>
          </Form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
