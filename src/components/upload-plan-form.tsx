
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, Plus, Folder, Loader2 } from 'lucide-react';
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
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ACCEPTED_FILE_TYPES = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const formSchema = z.object({
  title: z.string().min(3, { message: 'Plan başlığı en az 3 karakter olmalıdır.' }),
  type: z.enum(['annual', 'weekly'], { required_error: 'Lütfen bir plan türü seçin.' }),
  file: z
    .custom<FileList>()
    .refine((files) => files?.length > 0, 'Lütfen bir dosya seçin.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Maksimum dosya boyutu 25MB'dir.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Sadece .pdf, .doc, .docx, .xls, .xlsx formatları desteklenmektedir.'
    ),
});

type FormValues = z.infer<typeof formSchema>;

export type Plan = {
    id: string;
    title: string;
    type: 'annual' | 'weekly';
    fileDataUrl: string;
    uploadDate: string;
    fileType: string;
    fileName: string;
};

type UploadPlanFormProps = {
  onAddPlan: (plan: Plan) => void;
  isFirstPlan?: boolean;
};

export function UploadPlanForm({ onAddPlan, isFirstPlan = false }: UploadPlanFormProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      type: 'annual',
      file: undefined,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    const file = values.file[0];
    try {
      const fileDataUrl = await readFileAsDataURL(file);
      const newPlan: Plan = {
        id: `plan-${Date.now()}`,
        title: values.title,
        type: values.type,
        fileDataUrl,
        uploadDate: format(new Date(), 'dd.MM.yyyy'),
        fileType: file.type,
        fileName: file.name
      };
      onAddPlan(newPlan);
      form.reset();
      if(fileInputRef.current) fileInputRef.current.value = "";
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Dosya Okuma Hatası',
        description: 'Dosya okunurken bir sorun oluştu. Lütfen tekrar deneyin.',
        variant: 'destructive',
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const triggerButton = isFirstPlan ? (
    <Button size="lg">
      <Plus className="mr-2 h-5 w-5" />
      İlk Planını Yükle
    </Button>
  ) : (
    <Button>
      <Upload className="mr-2 h-4 w-4" />
      Plan Yükle
    </Button>
  );

  const selectedFile = form.watch('file');

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        form.reset();
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
      setOpen(isOpen);
    }}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Yeni Ders Planı Yükle</DialogTitle>
          <DialogDescription>
            Planınız için bir başlık girin, türünü seçin ve PDF, Word veya Excel dosyasını yükleyin.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Başlığı</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: 8. Sınıf Matematik Yıllık Planı" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Plan Türü</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="annual" id="r1" />
                        </FormControl>
                        <FormLabel htmlFor="r1" className="font-normal">Yıllık Plan</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="weekly" id="r2" />
                        </FormControl>
                        <FormLabel htmlFor="r2" className="font-normal">Haftalık Plan</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Dosya</FormLabel>
                    <FormControl>
                      <div>
                        <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                          <Folder className="mr-2 h-4 w-4 text-yellow-500" />
                          <span>{selectedFile?.[0]?.name ?? 'Dosya Seç'}</span>
                        </Button>
                        <Input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            onChange={(e) => onChange(e.target.files)}
                            {...rest}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isSubmitting}>
                  İptal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Planı Yükle
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
