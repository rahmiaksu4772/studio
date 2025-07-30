
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { UserProfile } from '@/app/ayarlar/page';

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Ad soyad en az 2 karakter olmalıdır.' }),
  title: z.string().min(2, { message: 'Unvan en az 2 karakter olmalıdır.' }),
  branch: z.string().min(2, { message: 'Branş en az 2 karakter olmalıdır.' }),
  workplace: z.string().min(2, { message: 'Görev yeri en az 2 karakter olmalıdır.' }),
});

type EditProfileFormValues = z.infer<typeof formSchema>;

type EditProfileFormProps = {
  user: UserProfile;
  onUpdate: (data: EditProfileFormValues) => void;
  onClose: () => void;
  isOpen: boolean;
};

export function EditProfileForm({ user, onUpdate, onClose, isOpen }: EditProfileFormProps) {
  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user.fullName,
      title: user.title,
      branch: user.branch,
      workplace: user.workplace,
    },
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName,
        title: user.title,
        branch: user.branch,
        workplace: user.workplace,
      });
    }
  }, [user, form]);

  function onSubmit(values: EditProfileFormValues) {
    onUpdate(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profil Bilgilerini Düzenle</DialogTitle>
          <DialogDescription>
            Kişisel bilgilerinizi güncelleyin. Değişiklikleri kaydetmek için butona tıklayın.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad Soyad</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: Ayşe Yılmaz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unvan</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: Matematik Öğretmeni" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branş</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: Matematik" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workplace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Görev Yeri</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: Atatürk İlkokulu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">
                        İptal
                    </Button>
                </DialogClose>
                <Button type="submit">Değişiklikleri Kaydet</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
