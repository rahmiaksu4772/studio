
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Loader2, ShieldCheck, User, GraduationCap, Users, MoreHorizontal, Trash2, UserCog } from 'lucide-react';
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
import { useAllUsersData, UserData } from '@/hooks/use-admin-data';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
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
import { deleteUserAction, updateUserRoleAction } from './actions';
import { useToast } from '@/hooks/use-toast';

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile(user?.uid);
  const { usersData, isLoading: usersLoading, setUsersData } = useAllUsersData(profile?.role === 'admin');
  const router = useRouter();
  const { toast } = useToast();

  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserData | null>(null);

  React.useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user || profile?.role !== 'admin') {
        router.replace('/anasayfa');
      }
    }
  }, [user, profile, authLoading, profileLoading, router]);

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    const result = await deleteUserAction(selectedUser.id);

    if (result.success) {
        toast({ title: 'Başarılı!', description: result.message });
        setUsersData(prev => prev.filter(u => u.id !== selectedUser.id));
    } else {
        toast({ title: 'Hata!', description: result.message, variant: 'destructive' });
    }
    setIsAlertOpen(false);
    setSelectedUser(null);
  };
  
  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'teacher') => {
      const result = await updateUserRoleAction(userId, newRole);
       if (result.success) {
        toast({ title: 'Başarılı!', description: result.message });
        setUsersData(prev => prev.map(u => u.id === userId ? {...u, role: newRole} : u));
    } else {
        toast({ title: 'Hata!', description: result.message, variant: 'destructive' });
    }
  };

  const openDeleteConfirm = (user: UserData) => {
    setSelectedUser(user);
    setIsAlertOpen(true);
  };

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
                            <TableHead className='text-right'>İşlemler</TableHead>
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
                                    <TableCell className="text-right">
                                       <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0" disabled={userData.id === user?.uid}>
                                                <span className="sr-only">Menüyü aç</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {userData.role === 'teacher' ? (
                                                    <DropdownMenuItem onClick={() => handleUpdateRole(userData.id, 'admin')}>
                                                        <UserCog className="mr-2 h-4 w-4" />
                                                        Admin Yap
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleUpdateRole(userData.id, 'teacher')}>
                                                        <User className="mr-2 h-4 w-4" />
                                                        Öğretmen Yap
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem className='text-destructive' onClick={() => openDeleteConfirm(userData)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Kullanıcıyı Sil
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </main>

        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                    Bu işlem geri alınamaz. "{selectedUser?.fullName}" adlı kullanıcıyı ve tüm verilerini (sınıflar, öğrenciler, kayıtlar) kalıcı olarak sileceksiniz.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedUser(null)}>İptal</AlertDialogCancel>
                <AlertDialogAction
                    onClick={handleDeleteUser}
                    className="bg-destructive hover:bg-destructive/90"
                >
                    Evet, Sil
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </AppLayout>
  );
}

export default AdminPage;
