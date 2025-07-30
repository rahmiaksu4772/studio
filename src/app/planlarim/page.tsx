
'use client';

import * as React from 'react';
import { Trash2, FileText, Plus, Loader2, Download, Sheet as ExcelIcon, File as WordIcon } from 'lucide-react';
import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { UploadPlanForm, type Plan } from '@/components/upload-plan-form';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function PlanlarimPage() {
  const { toast } = useToast();
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading existing plans
    setIsLoading(false);
  }, []);

  const handleAddPlan = (newPlan: Plan) => {
    setPlans(prevPlans => [newPlan, ...prevPlans]);
    toast({
      title: 'Plan Başarıyla Yüklendi!',
      description: `"${newPlan.title}" adlı planınız eklendi.`,
    });
  };

  const handleDeletePlan = (idToDelete: string) => {
    const planToDelete = plans.find(p => p.id === idToDelete);
    setPlans(prevPlans => prevPlans.filter(p => p.id !== idToDelete));
    toast({
      title: 'Plan Silindi',
      description: `"${planToDelete?.title}" adlı planınız başarıyla silindi.`,
      variant: 'destructive',
    });
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-24 w-24 text-muted-foreground" />;
    if (fileType.includes('word')) return <WordIcon className="h-24 w-24 text-muted-foreground" />;
    if (fileType.includes('sheet') || fileType.includes('excel')) return <ExcelIcon className="h-24 w-24 text-muted-foreground" />;
    return <FileText className="h-24 w-24 text-muted-foreground" />;
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
      <main className="flex-1 p-4 sm:p-6">
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
          <div className="grid gap-6 md:grid-cols-1">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                        <div className="flex items-center gap-3">
                            <CardTitle>{plan.title}</CardTitle>
                            <Badge variant={plan.type === 'annual' ? 'default' : 'secondary'}>
                                {plan.type === 'annual' ? 'Yıllık Plan' : 'Haftalık Plan'}
                            </Badge>
                        </div>
                        <CardDescription>Yüklenme Tarihi: {plan.uploadDate} | Dosya Türü: {plan.fileType.split('/')[1] || plan.fileType}</CardDescription>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sil
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
                <CardContent>
                  {plan.fileType === 'application/pdf' ? (
                     <div className="w-full aspect-[4/3] sm:aspect-[16/9] rounded-md border bg-muted overflow-hidden">
                        <iframe
                            src={plan.fileDataUrl}
                            className="w-full h-full"
                            title={plan.title}
                        />
                     </div>
                  ) : (
                    <div className="w-full aspect-[4/3] sm:aspect-[16/9] rounded-md border bg-muted flex flex-col items-center justify-center p-4">
                        {getFileIcon(plan.fileType)}
                        <p className='mt-4 font-semibold text-lg'>Önizleme mevcut değil</p>
                        <p className='text-muted-foreground text-sm mb-6'>Bu dosya türü tarayıcıda görüntülenemez.</p>
                        <a href={plan.fileDataUrl} download={plan.fileName}>
                            <Button>
                                <Download className="mr-2 h-4 w-4" />
                                Dosyayı İndir
                            </Button>
                        </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </AppLayout>
  );
}
