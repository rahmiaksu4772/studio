
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { FilePenLine, Plus, Share2, Trash2, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { mockExams } from '@/lib/mock-data';
import type { Exam } from '@/lib/types';


export default function OnlineSinavlarPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [exams, setExams] = React.useState<Exam[]>([]);
  const [shareableLink, setShareableLink] = React.useState<string | null>(null);

   const loadExams = React.useCallback(() => {
    const allExams: Exam[] = [...mockExams];
    try {
        const localStorageKeys = Object.keys(localStorage);
        localStorageKeys.forEach(key => {
        if (key.startsWith('exam_')) {
            const examData = JSON.parse(localStorage.getItem(key)!);
            allExams.push({
                id: key,
                title: examData.title,
                questions: examData.questions,
            });
        }
        });
    } catch(e) {
        console.error("Could not read from local storage", e);
    }
    
    // Remove duplicates, giving priority to localStorage
    const uniqueExams = allExams.reverse().reduce((acc, current) => {
        if (!acc.find(item => item.id === current.id)) {
            acc.push(current);
        }
        return acc;
    }, [] as Exam[]);
    setExams(uniqueExams);
  }, []);

   React.useEffect(() => {
    loadExams();
  }, [loadExams]);
  
  const handleShare = (examId: string) => {
    const link = `${window.location.origin}/sinav-yap/${examId}`;
    setShareableLink(link);
  }

  const copyLink = () => {
    if (shareableLink) {
        navigator.clipboard.writeText(shareableLink);
        toast({
            title: "Link Kopyalandı!",
            description: "Sınav linki panonuza kopyalandı."
        });
    }
  }
  
  const handleDelete = (examId: string) => {
      try {
        localStorage.removeItem(examId);
        toast({
            title: "Sınav Silindi",
            description: "Seçilen sınav başarıyla kaldırıldı.",
            variant: "destructive"
        });
        loadExams(); // Refresh the list
      } catch (e) {
        console.error("Could not delete from local storage", e);
        toast({
            title: "Hata",
            description: "Sınav silinirken bir hata oluştu.",
            variant: "destructive"
        });
      }
  }


  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Online Sınavlarım</h1>
            <p className="text-muted-foreground">
              Oluşturduğunuz sınavları yönetin veya yeni bir tane oluşturun.
            </p>
          </div>
          <Button size="lg" onClick={() => router.push('/online-sinav/olustur')}>
            <Plus className="mr-2 h-5 w-5" />
            Yeni Sınav Oluştur
          </Button>
        </div>
        
        {exams.length > 0 ? (
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {exams.map((exam) => (
                <Card key={exam.id} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className='text-lg'>{exam.title}</CardTitle>
                        <CardDescription>{exam.questions.length} Soru</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="text-sm text-muted-foreground">
                            {exam.questions.some(q => q.imageUrl) ? "Görsel içerir" : "Sadece metin"}
                        </div>
                    </CardContent>
                    <CardFooter className='grid grid-cols-2 gap-2'>
                        <Button variant="outline" className='w-full' onClick={() => router.push(`/online-sinav/olustur/${exam.id}`)}>
                            <Pencil className="h-4 w-4" /> Düzenle
                        </Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className='w-full'>
                                    <Trash2 className="h-4 w-4" /> Sil
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Sınavı silmek istediğinize emin misiniz?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    Bu işlem geri alınamaz. "{exam.title}" adlı sınav kalıcı olarak silinecektir.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(exam.id)} className="bg-destructive hover:bg-destructive/90">
                                    Sil
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button className='w-full col-span-2' onClick={() => handleShare(exam.id)}>
                            <Share2 className="h-4 w-4" /> Paylaş & Görüntüle
                        </Button>
                    </CardFooter>
                </Card>
              ))}
           </div>
        ) : (
            <Card className="flex items-center justify-center min-h-[60vh] border-dashed">
                <div className="text-center p-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <FilePenLine className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Henüz Sınav Oluşturulmadı</h2>
                    <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                       "Yeni Sınav Oluştur" butonuyla ilk sınavınızı hazırlamaya başlayın.
                    </p>
                    <Button size="lg" onClick={() => router.push('/online-sinav/olustur')}>
                       <Plus className="mr-2 h-5 w-5" />
                       Yeni Sınav Oluştur
                    </Button>
                </div>
            </Card>
        )}
      </main>

       <AlertDialog open={!!shareableLink} onOpenChange={(isOpen) => !isOpen && setShareableLink(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                       <Share2 className='h-5 w-5 text-primary' /> 
                       Sınavı Paylaş
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
                     <Button variant="outline" asChild>
                        <a href={shareableLink || ''} target="_blank" rel="noopener noreferrer">
                            Önizleme
                        </a>
                    </Button>
                    <Button onClick={copyLink}>Linki Kopyala</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </AppLayout>
  );
}

    