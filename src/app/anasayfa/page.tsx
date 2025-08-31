
'use client';

import Link from 'next/link';
import AppLayout from '@/components/app-layout';
import DersProgrami from '@/components/ders-programi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, Edit, ArrowRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import React from 'react';
import { useAllRecords, useClassesAndStudents } from '@/hooks/use-daily-records';
import { useAuth } from '@/hooks/use-auth';
import AuthGuard from '@/components/auth-guard';


function AnaSayfaPageContent() {
  const { user } = useAuth();
  const { classes, isLoading: isClassesLoading } = useClassesAndStudents(user?.uid);
  const { records, isLoading: isRecordsLoading } = useAllRecords(user?.uid);
  
  const [totalClasses, setTotalClasses] = React.useState(0);
  const [totalStudents, setTotalStudents] = React.useState(0);
  const [todaysRecords, setTodaysRecords] = React.useState(0);

  React.useEffect(() => {
    if (!isClassesLoading && classes) {
      setTotalClasses(classes.length);
      const studentCount = classes.reduce((acc, curr) => acc + curr.students.length, 0);
      setTotalStudents(studentCount);
    }
  }, [classes, isClassesLoading]);

  React.useEffect(() => {
    if (!isRecordsLoading && records) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayRecordsCount = records.filter(r => r.date === today).length;
      setTodaysRecords(todayRecordsCount);
    }
  }, [records, isRecordsLoading]);

  const isLoading = isClassesLoading || isRecordsLoading;

  return (
    <AppLayout>
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Hoş Geldiniz!</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Sınıf</CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <div className="text-2xl font-bold">{totalClasses}</div>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                     {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <div className="text-2xl font-bold">{totalStudents}</div>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bugünkü Kayıtlar</CardTitle>
                    <Edit className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <div className="text-2xl font-bold">{todaysRecords}</div>}
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="pb-2">
                    <CardTitle className='text-base'>Hızlı İşlemler</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                   <Link href="/gunluk-takip">
                     <Button variant="outline" className="w-full justify-start">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Bugünkü Takibi Yap
                     </Button>
                   </Link>
                   <Link href="/raporlar">
                     <Button variant="outline" className="w-full justify-start">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Raporları Görüntüle
                     </Button>
                   </Link>
                </CardContent>
            </Card>
        </div>
        
        <DersProgrami />

      </main>
    </AppLayout>
  );
}

export default function AnaSayfaPage() {
    return (
        <AuthGuard>
            <AnaSayfaPageContent />
        </AuthGuard>
    )
}
