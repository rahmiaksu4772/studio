
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Loader2, ShieldCheck, User, GraduationCap, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useAllUsersData } from '@/hooks/use-admin-data';

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile(user?.uid);
  const { usersData, isLoading: usersLoading } = useAllUsersData(profile?.role === 'admin');
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user || profile?.role !== 'admin') {
        router.replace('/anasayfa');
      }
    }
  }, [user, profile, authLoading, profileLoading, router]);

  const isLoading = authLoading || profileLoading || usersLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </AppLayout>
    );
  }

  if (profile?.role !== 'admin') {
    return null; // or a redirection component
  }

  return (
    <AppLayout>
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <div>
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    Admin Paneli
                </h2>
                <p className="text-muted-foreground">
                    Sistemdeki tüm kullanıcıları ve verilerini yönetin.
                </p>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Kullanıcı Listesi</CardTitle>
                <CardDescription>{usersData.length} öğretmen sisteme kayıtlı.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ad Soyad</TableHead>
                            <TableHead>E-posta</TableHead>
                            <TableHead className='text-center'>Rol</TableHead>
                            <TableHead className='text-center'>Sınıf Sayısı</TableHead>
                            <TableHead className='text-center'>Öğrenci Sayısı</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {usersData.map(userData => {
                            const totalStudents = userData.classes.reduce((sum, cls) => sum + cls.students.length, 0);
                            return (
                                <TableRow key={userData.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <User className='h-4 w-4 text-muted-foreground'/>
                                        {userData.fullName}
                                    </TableCell>
                                    <TableCell>{userData.email}</TableCell>
                                    <TableCell className='text-center'>
                                        <Badge variant={userData.role === 'admin' ? 'destructive' : 'secondary'}>
                                            {userData.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className='flex items-center justify-center gap-2'>
                                           <GraduationCap className='h-4 w-4 text-muted-foreground'/>
                                           {userData.classes.length}
                                        </div>
                                    </TableCell>
                                     <TableCell className="text-center">
                                        <div className='flex items-center justify-center gap-2'>
                                            <Users className='h-4 w-4 text-muted-foreground'/>
                                            {totalStudents}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}

export default AdminPage;
