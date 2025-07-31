
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
import { useToast } from '@/hooks/use-toast';
import type { ClassInfo } from '@/lib/types';

const formSchema = z.object({
  className: z.string().min(2, { message: 'Sınıf adı en az 2 karakter olmalıdır.' }),
});

type AddClassFormProps = {
  onAddClass: (className: string) => void;
  existingClasses: ClassInfo[];
};

export function AddClassForm({ onAddClass, existingClasses }: AddClassFormProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const dynamicFormSchema = formSchema.refine(
    (data) => !existingClasses.some(c => c.name.toLowerCase() === data.className.toLowerCase()),
    {
      message: 'Bu isimde bir sınıf zaten mevcut.',
      path: ['className'],
    }
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(dynamicFormSchema),
    defaultValues: {
      className: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        onAddClass(values.className);
        toast({
          title: 'Başarılı!',
          description: `"${values.className}" sınıfı eklendi.`,
        });
        form.reset();
        setOpen(false);
    } catch (error: any) {
        // This will be caught by the hook's try-catch, but as a fallback:
        form.setError("className", { type: "manual", message: error.message });
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Sınıf Ekle
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Yeni Sınıf Oluştur</h4>
            <p className="text-sm text-muted-foreground">Oluşturmak istediğiniz sınıfın adını girin.</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="className"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sınıf Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: 8/C" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Sınıfı Ekle</Button>
            </form>
          </Form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
