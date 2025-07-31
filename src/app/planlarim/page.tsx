
'use client';

import * as React from 'react';
import { Trash2, FileText, Plus, Loader2, Download, Sheet as ExcelIcon, File as WordIcon, X as CloseIcon } from 'lucide-react';
import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { UploadPlanForm } from '@/components/upload-plan-form';
import { Badge } from '@/components/ui/badge';
import type { Plan } from '@/lib/types';
import { format } from 'date-fns';

const PLANS_STORAGE_KEY = 'lesson-plans';

export default function PlanlarimPage() {
  const { toast } = useToast();
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [viewingPlan, setViewingPlan] = React.useState<Plan | null>(null);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIsLoading(true);
    try {
        const savedPlans = localStorage.getItem(PLANS_STORAGE_KEY);
        if (savedPlans) {
            setPlans(JSON.parse(savedPlans));
        }
    } catch (error) {
        console.error("Failed to load plans from localStorage", error);
        toast({
            title: "Planlar Yüklenemedi",
            description: "Planlarınız yüklenirken bir sorun oluştu.",
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    try {
        localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
    } catch (error) {
        console.error("Failed to save plans to localStorage", error);
        toast({
            title: "Planlar Kaydedilemedi",
            description: "Değişiklikleriniz kaydedilirken bir sorun oluştu.",
            variant: "destructive"
        });
    }
  }, [plans, toast]);


  const handleAddPlan = (planData: Omit<Plan, 'id' | 'uploadDate'>) => {
    const newPlan: Plan = {
      ...planData,
      id: new Date().toISOString(),
      uploadDate: format(new Date(), 'dd.MM.yyyy'),
    };
    setPlans(prevPlans => [newPlan, ...prevPlans]);
    toast({
      title: 'Plan Başarıyla Yüklendi!',
      description: `"${newPlan.title}" adlı planınız eklendi.`,
    });
  };

  const handleDeletePlan = async (idToDelete: string) => {
    const planToDelete = plans.find(p => p.id === idToDelete);
    setPlans(prevPlans => prevPlans.filter(p => p.id !== idToDelete));
    toast({
      title: 'Plan Silindi',
      description: `"${planToDelete?.title}" adlı planınız başarıyla silindi.`,
      variant: 'destructive',
    });
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-12 w-12 text-destructive" />;
    if (fileType.includes('word')) return <WordIcon className="h-12 w-12 text-blue-600" />;
    if (fileType.includes('sheet') || fileType.includes('excel')) return <ExcelIcon className="h-12 w-12 text-green-600" />;
    return <FileText className="h-12 w-12 text-muted-foreground" />;
  };

  const downloadFile = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dataURIToBlob = (dataURI: string): Blob | null => {
    try {
        const splitDataURI = dataURI.split(',');
        const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1]);
        const mimeString = splitDataURI[0].split(':')[1].split(';')[0];

        const ia = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++)
            ia[i] = byteString.charCodeAt(i);

        return new Blob([ia], { type: mimeString });
    } catch (error) {
        console.error("Error converting Data URI to Blob:", error);
        return null;
    }
  }

  const viewFile = (plan: Plan) => {
    if (plan.fileType.includes('pdf')) {
      const blob = dataURIToBlob(plan.fileDataUrl);
      if (blob) {
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setViewingPlan(plan);
      } else {
        toast({
          title: 'PDF Görüntülenemedi',
          description: 'Dosya verisi bozuk veya desteklenmiyor.',
          variant: 'destructive',
        });
      }
    } else {
      downloadFile(plan.fileDataUrl, plan.fileName);
    }
  };
  
  const closeViewer = () => {
    if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
    }
    setViewingPlan(null);
    setPdfUrl(null);
  }

  if (isLoading) {
    return (
      <AppLayout>
        <main className="flex-1 p-4 sm:p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Planlarım</h1>
            <p className="text-muted-foreground">
              Yıllık ve haftalık ders planlarınızı buradan yönetin.
            </p>
          </div>
          <UploadPlanForm onAddPlan={handleAddPlan} />
        </div>

        {plans.length === 0 ? (
          <Card className="flex-1 flex items-center justify-center min-h-[60vh] border-dashed">
            <div className="text-center p-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Henüz Plan Oluşturulmadı</h2>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                Yeni bir ders planı yükleyerek başlayın. Yüklediğiniz PDF, Word ve Excel planları burada görüntülenecektir.
              </p>
              <UploadPlanForm onAddPlan={handleAddPlan} isFirstPlan={true} />
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <div className='flex items-start justify-between gap-4'>
                    <div className="flex-shrink-0">
                      {getFileIcon(plan.fileType)}
                    </div>
                    <div className='flex-grow'>
                        <CardTitle className="text-base font-bold leading-tight mb-1">{plan.title}</CardTitle>
                        <Badge variant={plan.type === 'annual' ? 'default' : 'secondary'}>
                            {plan.type === 'annual' ? 'Yıllık Plan' : 'Haftalık Plan'}
                        </Badge>
                    </div>
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu işlem geri alınamaz. "{plan.title}" adlı planı kalıcı olarak silecektir.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeletePlan(plan.id)} className="bg-destructive hover:bg-destructive/90">
                            Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-xs text-muted-foreground">
                        Yüklenme T.: {plan.uploadDate} | Tür: {plan.fileType.split('/')[1] || plan.fileType}
                    </p>
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button variant="outline" className="w-full" onClick={() => viewFile(plan)}>
                        <FileText className="mr-2 h-4 w-4" /> Görüntüle
                    </Button>
                    <Button className="w-full" onClick={() => downloadFile(plan.fileDataUrl, plan.fileName)}>
                        <Download className="mr-2 h-4 w-4" /> İndir
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {viewingPlan && pdfUrl && (
          <div className="fixed inset-0 z-50 bg-black/80 flex flex-col p-4 animate-in fade-in-0">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-lg font-semibold text-white">{viewingPlan.title}</h2>
                <Button variant="destructive" size="icon" onClick={closeViewer}>
                    <CloseIcon className="h-6 w-6" />
                    <span className="sr-only">Kapat</span>
                </Button>
            </div>
            <div className="flex-1 w-full h-full bg-gray-800 rounded-lg overflow-hidden">
                <object data={pdfUrl} type="application/pdf" width="100%" height="100%">
                    <div className="flex flex-col items-center justify-center h-full text-white p-4">
                        <p className='text-center'>PDF görüntüleyici yüklenemedi. Tarayıcınız bu dosyayı desteklemiyor olabilir veya dosya bozuk olabilir.</p>
                        <Button asChild variant="secondary" className='mt-4'>
                          <a href={pdfUrl} download={viewingPlan.fileName}>
                            <Download className="mr-2 h-4 w-4"/> Dosyayı İndir
                          </a>
                        </Button>
                    </div>
                </object>
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  );
}
