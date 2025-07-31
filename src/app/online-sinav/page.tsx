
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wand2, Loader2, ListPlus, Trash2, Save, FilePenLine } from 'lucide-react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { generateExamAction } from '../actions';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const examGeneratorSchema = z.object({
  topic: z.string().min(3, 'Konu en az 3 karakter olmalıdır.'),
  gradeLevel: z.string().min(1, 'Sınıf seviyesi zorunludur.'),
  questionCount: z.coerce.number().min(1, 'En az 1 soru olmalıdır.').max(20, 'En fazla 20 soru olabilir.'),
});

const examFormSchema = z.object({
  title: z.string().min(3, 'Sınav başlığı zorunludur.'),
  questions: z.array(z.object({
    question: z.string().min(5, 'Soru metni zorunludur.'),
    options: z.array(z.string().min(1, 'Seçenek boş olamaz.')).length(4, '4 seçenek olmalıdır.'),
    correctAnswer: z.string({ required_error: 'Doğru cevap seçimi zorunludur.'}),
  })).min(1, "Sınavda en az bir soru olmalıdır."),
});

type ExamGeneratorValues = z.infer<typeof examGeneratorSchema>;
type ExamFormValues = z.infer<typeof examFormSchema>;

export default function OnlineSinavPage() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generatorForm = useForm<ExamGeneratorValues>({
    resolver: zodResolver(examGeneratorSchema),
    defaultValues: { topic: '', gradeLevel: '8. Sınıf', questionCount: 5 },
  });

  const examForm = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues: { title: '', questions: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: examForm.control,
    name: 'questions',
  });

  const handleGenerateExam = async (values: ExamGeneratorValues) => {
    setIsGenerating(true);
    examForm.reset({ title: `${values.gradeLevel} ${values.topic} Sınavı`, questions: [] });
    
    try {
      const result = await generateExamAction(values);
      if (result.error) {
        toast({ title: 'Sınav Oluşturulamadı', description: result.error, variant: 'destructive' });
      } else {
        const mappedQuestions = result.exam.questions.map(q => ({
          question: q.question,
          options: [q.options.a, q.options.b, q.options.c, q.options.d],
          correctAnswer: q.correctAnswer,
        }));
        examForm.setValue('questions', mappedQuestions);
        examForm.setValue('title', `${values.gradeLevel} ${values.topic} Sınavı`);
        toast({ title: 'Sınav Oluşturuldu!', description: `${result.exam.questions.length} soru başarıyla oluşturuldu.` });
      }
    } catch (e) {
      toast({ title: 'Bir Hata Oluştu', description: 'Sınav oluşturulurken beklenmedik bir hata oluştu.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };
  
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
              AI ile hızlıca sınav oluşturun veya soruları kendiniz ekleyin.
            </p>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <Card className="lg:col-span-1 sticky top-20">
            <CardHeader>
              <CardTitle>AI Sınav Üretici</CardTitle>
              <CardDescription>Yapay zeka ile hızlı bir başlangıç yapın.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generatorForm}>
                <form onSubmit={generatorForm.handleSubmit(handleGenerateExam)} className="space-y-4">
                  <FormField
                    control={generatorForm.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konu</FormLabel>
                        <FormControl>
                          <Input placeholder="Örn: Üslü Sayılar" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={generatorForm.control}
                    name="gradeLevel"
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
                    control={generatorForm.control}
                    name="questionCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Soru Sayısı</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isGenerating} className="w-full">
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Yapay Zeka ile Oluştur
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            {isGenerating ? (
                <Card className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <h3 className="text-xl font-semibold">Sınavınız Oluşturuluyor...</h3>
                    <p className="text-muted-foreground">Yapay zeka, sorularınızı hazırlıyor. Bu işlem birkaç saniye sürebilir.</p>
                </Card>
            ) : fields.length > 0 ? (
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
                           Soldaki formu kullanarak AI ile bir sınav oluşturun veya "Soru Ekle" butonuyla kendi sınavınızı hazırlamaya başlayın.
                        </p>
                        <Button type="button" variant="default" size="lg" onClick={addQuestion}>
                            <ListPlus className="mr-2 h-4 w-4" />
                            İlk Soruyu Ekle
                        </Button>
                    </div>
                </Card>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
