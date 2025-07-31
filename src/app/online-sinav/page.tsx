
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ListPlus, Trash2, Save, FilePenLine } from 'lucide-react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const examFormSchema = z.object({
  title: z.string().min(3, 'Sınav başlığı zorunludur.'),
  questions: z.array(z.object({
    question: z.string().min(5, 'Soru metni zorunludur.'),
    options: z.array(z.string().min(1, 'Seçenek boş olamaz.')).length(4, '4 seçenek olmalıdır.'),
    correctAnswer: z.string({ required_error: 'Doğru cevap seçimi zorunludur.'}),
  })).min(1, "Sınavda en az bir soru olmalıdır."),
});

type ExamFormValues = z.infer<typeof examFormSchema>;

export default function OnlineSinavPage() {
  const { toast } = useToast();

  const examForm = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues: { title: 'Yeni Sınav', questions: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: examForm.control,
    name: 'questions',
  });
  
  const handleSaveExam = (values: ExamFormValues) => {
      console.log("Kaydedilen Sınav:", values);
      toast({
          title: "Sınav Başarıyla Kaydedildi!",
          description: "Sınavınız kaydedildi. (Detaylar için konsolu kontrol edin)"
      });
  }
  
  const addQuestion = () => {
    append({ question: '', options: ['', '', '', ''], correctAnswer: '' });
  };

  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Online Sınav Oluşturucu</h1>
            <p className="text-muted-foreground">
              Soruları manuel olarak ekleyerek kendi sınavınızı oluşturun.
            </p>
          </div>
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
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                                 <FormField
                                    control={examForm.control}
                                    name={`questions.${index}.question`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea placeholder="Soru metnini yazın..." {...field} className="bg-background"/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
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
                                Sınavı Kaydet
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
      </main>
    </AppLayout>
  );
}
