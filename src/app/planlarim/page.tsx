
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
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { UploadPlanForm } from '@/components/upload-plan-form';
import { Badge } from '@/components/ui/badge';
import type { Plan, Lesson, Day, WeeklyScheduleItem } from '@/lib/types';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import AuthGuard from '@/components/auth-guard';
import { useWeeklySchedule } from '@/hooks/use-weekly-schedule';
import * as XLSX from 'xlsx';

const PLANS_STORAGE_KEY_PREFIX = 'lesson-plans_';
const dayOrder: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

function PlanlarimPageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { setSchedule } = useWeeklySchedule();
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [viewingPlan, setViewingPlan] = React.useState<Plan | null>(null);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);

  const getStorageKey = React.useCallback(() => {
    if (!user) return null;
    return `${PLANS_STORAGE_KEY_PREFIX}${user.uid}`;
  }, [user]);

  React.useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
        setIsLoading(false);
        return;
    }
    
    setIsLoading(true);
    try {
        const savedPlans = localStorage.getItem(storageKey);
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
  }, [toast, getStorageKey]);

  React.useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey || isLoading) return;
    try {
        localStorage.setItem(storageKey, JSON.stringify(plans));
    } catch (error) {
        console.error("Failed to save plans to localStorage", error);
        toast({
            title: "Planlar Kaydedilemedi",
            description: "Değişiklikleriniz kaydedilirken bir sorun oluştu.",
            variant: "destructive"
        });
    }
  }, [plans, toast, getStorageKey, isLoading]);

  const processAndImportSchedule = async (file: File) => {
    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        const newSchedule: WeeklyScheduleItem[] = dayOrder.map(day => ({ day, lessons: [] }));
        
        // Assuming format: Day, Time (HH:mm - HH:mm), Subject, Class
        // Skip header row by starting from 1
        for(let i = 1; i < json.length; i++) {
            const row = json[i];
            const [day, time, subject, className] = row;
            
            const targetDay = newSchedule.find(d => d.day === day);
            if (targetDay && time && subject && className) {
                targetDay.lessons.push({
                    id: new Date().toISOString() + Math.random(),
                    time,
                    subject,
                    class: className
                });
            }
        }
        
        await setSchedule(newSchedule);

        toast({
            title: 'Program Aktarıldı!',
            description: 'Ders programınız başarıyla takvime aktarıldı.',
        });

    } catch (error) {
        console.error("Error processing schedule file:", error);
        toast({
            title: "Program Aktarılamadı",
            description: "Excel dosyası işlenirken bir hata oluştu.",
            variant: "destructive"
        });
    }
  };

  const handleAddPlan = (planData: Omit<Plan, 'id' | 'uploadDate'>, importToSchedule: boolean, file?: File) => {
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
    
    if (importToSchedule && file) {
      processAndImportSchedule(file);
    }
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
    if (fileType.includes('pdf')) return <FileText className="h-10 w-10 text-red-500" />;
    if (fileType.includes('word')) return <WordIcon className="h-10 w-10 text-blue-500" />;
    if (fileType.includes('sheet') || fileType.includes('excel')) return <ExcelIcon className="h-10 w-10 text-green-500" />;
    return <FileText className="h-10 w-10 text-gray-500" />;
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
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="flex-1 space-y-4 p-8 pt-6 relative">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Planlarım</h2>
          <UploadPlanForm onAddPlan={handleAddPlan} />
        </div>

        {plans.length === 0 ? (
          <div className="flex-1 flex items-center justify-center rounded-lg border-2 border-dashed min-h-[60vh]">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz plan oluşturulmadı</h3>
              <p className="mt-1 text-sm text-gray-500">Yeni bir ders planı yükleyerek başlayın.</p>
              <div className="mt-6">
                <UploadPlanForm onAddPlan={handleAddPlan} isFirstPlan={true} />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">{plan.title}</CardTitle>
                        <Badge variant={plan.type === 'annual' ? 'default' : 'secondary'}>
                            {plan.type === 'annual' ? 'Yıllık Plan' : 'Haftalık Plan'}
                        </Badge>
                    </div>
                    {getFileIcon(plan.fileType)}
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">
                        Yüklenme Tarihi: {plan.uploadDate}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Dosya Türü: {plan.fileType.split('/')[1] || plan.fileType}
                    </p>
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button variant="outline" className="w-full" onClick={() => viewFile(plan)}>
                        <FileText className="mr-2 h-4 w-4" /> Görüntüle
                    </Button>
                    <Button className="w-full" onClick={() => downloadFile(plan.fileDataUrl, plan.fileName)}>
                        <Download className="mr-2 h-4 w-4" /> İndir
                    </Button>
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
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
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {viewingPlan && pdfUrl && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-4xl flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">{viewingPlan.title}</h2>
                    <Button variant="ghost" size="icon" onClick={closeViewer}>
                        <CloseIcon className="h-6 w-6" />
                    </Button>
                </div>
                <div className="flex-1 w-full h-full">
                    <object data={pdfUrl} type="application/pdf" width="100%" height="100%">
                        <p>PDF görüntüleyici yüklenemedi. Tarayıcınız desteklemiyor olabilir.</p>
                    </object>
                </div>
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  );
}

export default function PlanlarimPage() {
    return (
      <AuthGuard>
        <PlanlarimPageContent />
      </AuthGuard>
    );
  }
