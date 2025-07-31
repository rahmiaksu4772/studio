
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { type ExamFormValues } from '@/app/online-sinav/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, FileWarning, CheckCircle } from 'lucide-react';

type AnswerSheet = {
    [key: number]: string;
}

export default function SinavYapPage() {
    const params = useParams();
    const examId = params.id as string;
    const [exam, setExam] = React.useState<ExamFormValues | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [answers, setAnswers] = React.useState<AnswerSheet>({});
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    React.useEffect(() => {
        if (examId) {
            try {
                const examData = localStorage.getItem(examId);
                if (examData) {
                    setExam(JSON.parse(examData));
                } else {
                    setError('Bu ID\'ye sahip bir sınav bulunamadı. Linkin doğru olduğundan emin olun.');
                }
            } catch (err) {
                console.error("Sınav yüklenirken hata:", err);
                setError('Sınav yüklenirken bir hata oluştu.');
            } finally {
                setIsLoading(false);
            }
        }
    }, [examId]);

    const handleAnswerChange = (questionIndex: number, answer: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: answer
        }));
    };

    const handleSubmit = () => {
        // Here you would typically send the answers to a server for grading.
        // For this demo, we'll just mark it as submitted.
        console.log("Submitted Answers:", answers);
        setIsSubmitted(true);
    };
    
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-muted/40">
              <div className='text-center'>
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                <p className='text-lg font-semibold'>Sınav Yükleniyor...</p>
              </div>
            </div>
        );
    }
    
    if (error) {
        return (
             <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
              <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <CardTitle className='flex items-center justify-center gap-2 text-destructive'>
                        <FileWarning className='h-8 w-8' />
                        Sınav Yüklenemedi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                </CardContent>
              </Card>
            </div>
        );
    }
    
    if (!exam) return null;

    if (isSubmitted) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
              <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <CardTitle className='flex items-center justify-center gap-2 text-green-600'>
                        <CheckCircle className='h-12 w-12' />
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                    <h2 className='text-2xl font-bold'>Sınav Tamamlandı!</h2>
                    <p className='text-muted-foreground'>Cevaplarınız başarıyla gönderildi. Sonuçlarınız öğretmeniniz tarafından değerlendirilecektir.</p>
                </CardContent>
              </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
            <main className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardHeader className='text-center'>
                        <CardTitle className='text-3xl font-bold'>{exam.title}</CardTitle>
                        <CardDescription>Lütfen tüm soruları dikkatlice okuyup cevaplayın. Başarılar!</CardDescription>
                    </CardHeader>
                </Card>

                {exam.questions.map((q, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle className='text-lg'>Soru {index + 1}</CardTitle>
                            <CardDescription>{q.question}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {q.imageUrl && (
                                <div className="mb-4 rounded-lg overflow-hidden border">
                                    <img src={q.imageUrl} alt={`Soru ${index + 1} için görsel`} className="w-full max-h-[400px] object-contain" />
                                </div>
                            )}
                            <RadioGroup 
                                onValueChange={(value) => handleAnswerChange(index, value)}
                                value={answers[index] || ''}
                                className="space-y-2"
                            >
                                {q.options.map((option, optionIndex) => {
                                    const optionChar = String.fromCharCode(65 + optionIndex); // A, B, C, D
                                    const id = `q${index}-o${optionIndex}`;
                                    return (
                                        <Label htmlFor={id} key={id} className="flex items-center gap-4 p-3 rounded-lg border has-[:checked]:bg-primary/10 has-[:checked]:border-primary cursor-pointer transition-colors">
                                            <RadioGroupItem value={optionChar} id={id} />
                                            <span className="font-semibold">{optionChar})</span>
                                            <span>{option}</span>
                                        </Label>
                                    );
                                })}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                ))}

                <div className='text-center py-4'>
                    <Button size="lg" onClick={handleSubmit}>
                        Sınavı Bitir ve Gönder
                    </Button>
                </div>
            </main>
        </div>
    );
}

