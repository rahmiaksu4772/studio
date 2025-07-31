
'use client';

import Link from 'next/link';
import AppLayout from '@/components/app-layout';
import DersProgrami from '@/components/ders-programi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, Edit, ArrowRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { getClasses, getRecordsForReport } from '@/services/firestore';
import React from 'react';
import type { ClassInfo, Student } from '@/lib/types';

export default function AnaSayfaPage() {
  const [totalClasses, setTotalClasses] = React.useState(0);
  const [totalStudents, setTotalStudents] = React.useState(0);
  const [todaysRecords, setTodaysRecords] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDashboardData() {
        setIsLoading(true);
        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            const classes = await getClasses();
            
            // This is a simplified student count. For a precise count, 
            // you might need a separate query or aggregate data in Firestore.
            // For now, we'll just show class count. A more robust solution
            // would involve fetching all students for all classes, which can be slow.
            // A better approach in a real app is to store studentCount on the class document.
            // For this demo, we'll keep it simple.
            
            // We can get today's records count for ALL classes.
            const recordsPromises = classes.map(c => getRecordsForReport(c.id, today, today));
            const recordsPerClass = await Promise.all(recordsPromises);
            const totalTodaysRecords = recordsPerClass.reduce((acc, records) => acc + records.length, 0);

            setTotalClasses(classes.length);
            setTodaysRecords(totalTodaysRecords);
            // student count will be left as 0 for now to avoid many reads.
            
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    }
    fetchDashboardData();
  }, []);

  return (
    <AppLayout>
      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hoş Geldiniz, Ayşe Öğretmen!</h1>
            <p className="text-muted-foreground">
              İşte bugünün özeti ve hızlı işlemler.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Sınıf</CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <div className="text-2xl font-bold">{totalClasses}</div>}
                    <p className="text-xs text-muted-foreground">Yönetilen sınıf sayısı</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">N/A</div>
                     <p className="text-xs text-muted-foreground">Tüm sınıflardaki öğrenci sayısı</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bugünkü Kayıtlar</CardTitle>
                    <Edit className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <div className="text-2xl font-bold">{todaysRecords}</div>}
                    <p className="text-xs text-muted-foreground">Bugün girilen değerlendirme</p>
                </CardContent>
            </Card>
             <Card className='bg-primary/10 border-primary/20'>
                <CardHeader className="pb-2">
                    <CardTitle className="text-md font-semibold text-primary">Hızlı İşlemler</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                   <Link href="/gunluk-takip">
                     <Button variant="outline" className="w-full justify-between hover:bg-primary/10">
                        Bugünkü Takibi Yap <ArrowRight className="h-4 w-4" />
                     </Button>
                   </Link>
                   <Link href="/raporlar">
                     <Button variant="outline" className="w-full justify-between hover:bg-primary/10">
                        Raporları Görüntüle <ArrowRight className="h-4 w-4" />
                     </Button>
                   </Link>
                </CardContent>
            </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
            <DersProgrami />
        </div>
      </main>
    </AppLayout>
  );
}
