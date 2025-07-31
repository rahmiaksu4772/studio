
'use client';

import Link from 'next/link';
import AppLayout from '@/components/app-layout';
import DersProgrami from '@/components/ders-programi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, Edit, ArrowRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import React from 'react';
import { useDailyRecords } from '@/hooks/use-daily-records';
import { useClassesAndStudents } from '@/hooks/use-classes-and-students';

export default function AnaSayfaPage() {
  const { classes, students, isLoading: isClassesLoading } = useClassesAndStudents();
  const { records, isLoading: isRecordsLoading } = useDailyRecords();
  
  const [totalClasses, setTotalClasses] = React.useState(0);
  const [totalStudents, setTotalStudents] = React.useState(0);
  const [todaysRecords, setTodaysRecords] = React.useState(0);

  React.useEffect(() => {
    if (!isClassesLoading) {
      setTotalClasses(classes.length);
      const studentCount = classes.reduce((acc, curr) => acc + curr.students.length, 0);
      setTotalStudents(studentCount);
    }
  }, [classes, isClassesLoading]);

  React.useEffect(() => {
    if (!isRecordsLoading) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayRecordsCount = records.filter(r => r.date === today).length;
      setTodaysRecords(todayRecordsCount);
    }
  }, [records, isRecordsLoading]);

  const isLoading = isClassesLoading || isRecordsLoading;

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
                     {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <div className="text-2xl font-bold">{totalStudents}</div>}
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
