
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ListPlus, Trash2, Save, FilePenLine, ImagePlus, X as CloseIcon, Share2, ArrowLeft } from 'lucide-react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
    AlertDialog, 
    AlertDialogContent, 
    AlertDialogHeader, 
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel
} from '@/components/ui/alert-dialog';
import { useRouter, useParams } from 'next/navigation';
import type { ExamFormValues } from '@/lib/types';


const examFormSchema = z.object({
  title: z.string().min(3, 'Sınav başlığı en az 3 karakter olmalıdır.'),
  questions: z.array(z.object({
    question: z.string().min(5, 'Soru metni zorunludur.'),
    imageUrl: z.string().optional(),
    options: z.array(z.string().min(1, 'Seçenek boş olamaz.')).length(4, '4 seçenek olmalıdır.'),
    correctAnswer: z.string({ required_error: 'Doğru cevap seçimi zorunludur.'}),
  })).min(1, "Sınavda en az bir soru olmalıdır."),
});

export default function OnlineSinavOlusturPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const fileInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const [shareableLink, setShareableLink] = React.useState<string | null>(null);
  
  const examId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isEditing = !!examId;

  const examForm = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues: { title: '', questions: [] },
  });
  
  React.useEffect(() => {
    if (isEditing && examId) {
        const storedExam = localStorage.getItem(examId);
        if (storedExam) {
            try {
                const examData = JSON.parse(storedExam);
                examForm.reset(examData);
            } catch (error) {
                console.error("Failed to parse exam data", error);
                toast({
                    title: "Hata",
                    description: "Sınav verisi yüklenirken bir hata oluştu.",
                    variant: "destructive"
                });
                router.push('/online-sinav');
            }
        } else {
             toast({
                title: "Sınav Bulunamadı",
                description: "Düzenlenecek sınav bulunamadı.",
                variant: "destructive"
            });
            router.push('/online-sinav');
        }
    }
  }, [isEditing, examId, router, toast, examForm]);

  const { fields, append, remove, update } = useFieldArray({
    control: examForm.control,
    name: 'questions',
  });
  
  const handleSaveExam = (values: ExamFormValues) => {
      const idToSave = isEditing ? examId : `exam_${Date.now().toString(36)}`;
      try {
        localStorage.setItem(idToSave!, JSON.stringify(values));
        if (isEditing) {
            toast({
                title: "Sınav Güncellendi!",
                description: `"${values.title}" başarıyla güncellendi.`
            });
            router.push('/online-sinav');
        } else {
            const link = `${window.location.origin}/sinav-yap/${idToSave}`;
            setShareableLink(link);
        }
      } catch (error) {
          console.error("Sınav kaydedilirken hata:", error);
          toast({
              title: "Kaydetme Başarısız",
              description: "Sınav yerel depolamaya kaydedilemedi. Tarayıcınız bu özelliği desteklemiyor veya depolama alanı dolu olabilir.",
              variant: "destructive"
          });
      }
  }
  
  const addQuestion = () => {
    append({ question: '', imageUrl: undefined, options: ['', '', '', ''], correctAnswer: '' });
  };
  
  const handleImageUpload = (file: File, index: number) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const field = fields[index];
        update(index, { ...field, imageUrl: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };
  
  const copyLink = () => {
    if (shareableLink) {
        navigator.clipboard.writeText(shareableLink);
        toast({
            title: "Link Kopyalandı!",
            description: "Sınav linki panonuza kopyalandı."
        });
    }
  }
  
  const pageTitle = isEditing ? "Sınavı Düzenle" : "Yeni Sınav Oluştur";
  const saveButtonText = isEditing ? "Değişiklikleri Kaydet" : "Sınavı Kaydet ve Paylaş";


  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.push('/online-sinav')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri Dön
            </Button>
            <h1 className="text-xl font-bold tracking-tight">{pageTitle}</h1>
        </div>
        
        <div className="max-w-4xl mx-auto">
            {fields.length > 0 ? (
              <Form {...examForm}>
                <form onSubmit={examForm.handleSubmit(handleSaveExam)} className="space-y-6">
                    <Card>
                        <CardHeader>
                             <FormField
                                control={examForm.control}
                                name="title"
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Sınav Başlığı" className="text-xl font-bold border-0 shadow-none p-0 focus-visible:ring-0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <CardDescription>Oluşturulan soruları düzenleyebilir, silebilir veya yeni sorular ekleyebilirsiniz.</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                           {fields.map((field, index) => (
                             <Card key={field.id} className="p-4 bg-muted/50">
                                <div className="flex justify-between items-start mb-2">
                                  <Label className="font-semibold">Soru {index + 1}</Label>
                                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>

                                {field.imageUrl && (
                                    <div className="relative mb-2">
                                        <img src={field.imageUrl} alt={`Soru ${index + 1} resmi`} className="rounded-lg w-full max-h-80 object-contain border bg-white" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-7 w-7 rounded-full"
                                            onClick={() => update(index, { ...field, imageUrl: undefined })}
                                        >
                                            <CloseIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                <div className="flex items-start gap-2">
                                     <FormField
                                        control={examForm.control}
                                        name={`questions.${index}.question`}
                                        render={({ field }) => (
                                        <FormItem className='flex-1'>
                                            <FormControl>
                                                <Textarea placeholder="Soru metnini yazın..." {...field} className="bg-background"/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <Button type='button' variant='outline' size='icon' onClick={() => fileInputRefs.current[index]?.click()}>
                                        <ImagePlus className='h-5 w-5' />
                                    </Button>
                                    <input 
                                        type="file" 
                                        className="hidden"
                                        accept="image/*"
                                        ref={el => fileInputRefs.current[index] = el}
                                        onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], index)}
                                    />
                                </div>
                                <div className='mt-4'>
                                <FormField
                                    control={examForm.control}
                                    name={`questions.${index}.correctAnswer`}
                                    render={({ field: radioField }) => (
                                        <FormItem>
                                            <FormControl>
                                                 <RadioGroup
                                                    onValueChange={radioField.onChange}
                                                    value={radioField.value}
                                                    className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2"
                                                >
                                                    {['A', 'B', 'C', 'D'].map((optionChar, optionIndex) => (
                                                        <FormField
                                                            key={`${field.id}-option-${optionIndex}`}
                                                            control={examForm.control}
                                                            name={`questions.${index}.options.${optionIndex}`}
                                                            render={({ field: inputField }) => (
                                                                <FormItem className="flex items-center space-x-2 p-2 rounded-md bg-background border">
                                                                     <FormControl>
                                                                        <RadioGroupItem value={optionChar} id={`${field.id}-option-${optionIndex}`} />
                                                                    </FormControl>
                                                                    <Label htmlFor={`${field.id}-option-${optionIndex}`} className="flex-1">
                                                                        <Input {...inputField} className="border-0 shadow-none h-auto p-0 focus-visible:ring-0" placeholder={`Seçenek ${optionChar}`}/>
                                                                    </Label>
                                                                </FormItem>
                                                            )}
                                                            />
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage className='pt-2' />
                                        </FormItem>
                                     )}
                                />
                                </div>
                             </Card>
                           ))}
                           <div className="flex justify-between gap-2">
                            <Button type="button" variant="outline" onClick={addQuestion}>
                                <ListPlus className="mr-2 h-4 w-4" />
                                Soru Ekle
                            </Button>
                             <Button type="submit">
                                <Save className="mr-2 h-4 w-4" />
                                {saveButtonText}
                            </Button>
                           </div>
                        </CardContent>
                    </Card>
                    <FormField
                      control={examForm.control}
                      name="questions"
                      render={({ fieldState }) => <FormMessage>{fieldState.error?.message}</FormMessage>}
                    />
                </form>
              </Form>
            ) : (
                 <Card className="flex items-center justify-center min-h-[60vh] border-dashed">
                    <div className="text-center p-6">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <FilePenLine className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Başlamaya Hazır</h2>
                        <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                           "Soru Ekle" butonuyla kendi sınavınızı hazırlamaya başlayın.
                        </p>
                        <Button type="button" variant="default" size="lg" onClick={addQuestion}>
                            <ListPlus className="mr-2 h-4 w-4" />
                            İlk Soruyu Ekle
                        </Button>
                    </div>
                </Card>
            )}
        </div>
        
        <AlertDialog open={!!shareableLink} onOpenChange={(isOpen) => {
            if (!isOpen) {
                setShareableLink(null);
                router.push('/online-sinav');
            }
        }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                       <Share2 className='h-5 w-5 text-primary' /> 
                       Sınavınız Paylaşılmaya Hazır!
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Aşağıdaki linki kopyalayarak öğrencilerinizle paylaşabilirsiniz. Bu linke sahip olan herkes sınava erişebilir.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className='py-4'>
                    <Input 
                        readOnly
                        value={shareableLink || ''}
                        className="bg-muted"
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Kapat</AlertDialogCancel>
                    <Button onClick={copyLink}>Linki Kopyala</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </main>
    </AppLayout>
  );
}

    