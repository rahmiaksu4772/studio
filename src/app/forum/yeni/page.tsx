
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/app-layout';
import AuthGuard from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';

const categories = ['Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilgiler', 'Eğitim Teknolojileri', 'Okul Öncesi', 'Rehberlik', 'Diğer'];

const formSchema = z.object({
  title: z.string().min(10, { message: 'Başlık en az 10 karakter olmalıdır.' }).max(150, { message: 'Başlık en fazla 150 karakter olabilir.' }),
  description: z.string().max(2000, { message: 'Açıklama en fazla 2000 karakter olabilir.' }).optional(),
  category: z.string({ required_error: 'Lütfen bir kategori seçin.' }),
});

function NewPostPageContent() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // In a real app, you would save this to Firestore
    console.log(values);
    toast({
      title: 'Sorunuz Gönderildi!',
      description: 'Sorunuz foruma eklendi ve yakında meslektaşlarınız tarafından yanıtlanacaktır.',
    });
    router.push('/forum');
  };

  return (
    <AppLayout>
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div>
            <Link href="/forum" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Foruma Geri Dön
            </Link>
            <h2 className="text-3xl font-bold tracking-tight">Yeni Soru Sor</h2>
            <p className="text-muted-foreground mt-1">
                Meslektaşlarınızın yardımına veya fikrine ihtiyaç duyduğunuz konuyu paylaşın.
            </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardContent className="p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Soru Başlığı</FormLabel>
                      <FormControl>
                        <Input placeholder="Örn: Kesirleri öğretirken kullanılabilecek interaktif materyaller nelerdir?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Kategori</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sorunuzun ilgili olduğu kategoriyi seçin..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Açıklama (İsteğe Bağlı)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Sorunuzu daha detaylı açıklayabilirsiniz. Mevcut durumu, denediğiniz yöntemleri veya aradığınız çözümün özelliklerini belirtebilirsiniz." 
                          rows={8}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="border-t p-6">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  Soruyu Gönder
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </main>
    </AppLayout>
  );
}

export default function NewPostPage() {
    return (
        <AuthGuard>
            <NewPostPageContent />
        </AuthGuard>
    )
}
