
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Loader2, ShieldCheck, User, GraduationCap, Users, MoreHorizontal, Trash2, UserCog, UserCheck, UserX, Send } from 'lucide-react';
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
import { deleteUserAction, updateUserRoleAction, sendPasswordResetEmailAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/lib/types';


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
        toast({ title: 'Başarılı!', description: result.message, variant: 'destructive' });
        setUsersData(prev => prev.filter(u => u.id !== selectedUser.id));
    } else {
        toast({ title: 'Hata!', description: result.message, variant: 'destructive' });
    }
    setIsAlertOpen(false);
    setSelectedUser(null);
  };
  
  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
      const result = await updateUserRoleAction(userId, newRole);
       if (result.success) {
        toast({ title: 'Başarılı!', description: result.message });
        setUsersData(prev => prev.map(u => u.id === userId ? {...u, role: newRole} : u));
    } else {
        toast({ title: 'Hata!', description: result.message, variant: 'destructive' });
    }
  };

  const handlePasswordReset = async (email: string) => {
    const result = await sendPasswordResetEmailAction(email);
    if (result.success) {
        toast({ title: 'Başarılı!', description: result.message });
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
  
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
        case 'admin': return 'destructive';
        case 'teacher': return 'secondary';
        case 'beklemede': return 'premium';
        default: return 'outline';
    }
  }

  return (
    <AppLayout>
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
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

        <div className="grid gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Kullanıcı Listesi</CardTitle>
                    <CardDescription>{usersData.length} kullanıcı sisteme kayıtlı.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[800px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Ad Soyad</TableHead>
                                    <TableHead>E-posta</TableHead>
                                    <TableHead className='text-center'>Rol</TableHead>
                                    <TableHead className='text-center'>Sınıf Sayısı</TableHead>
                                    <TableHead className='text-center'>Öğrenci Sayısı</TableHead>
                                    <TableHead className='text-right pr-6'>İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {usersData.map(userData => {
                                    const totalStudents = userData.classes.reduce((sum, cls) => sum + cls.students.length, 0);
                                    return (
                                        <TableRow key={userData.id}>
                                            <TableCell className="font-medium flex items-center gap-2 pl-6">
                                                <User className='h-4 w-4 text-muted-foreground'/>
                                                {userData.fullName}
                                            </TableCell>
                                            <TableCell>{userData.email}</TableCell>
                                            <TableCell className='text-center'>
                                                <Badge variant={getRoleBadgeVariant(userData.role)}>
                                                    {userData.role === 'beklemede' ? 'Onay Bekliyor' : userData.role}
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
                                            <TableCell className="text-right pr-6">
                                            {userData.id !== user?.uid ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Menüyü aç</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onSelect={() => handlePasswordReset(userData.email)}>
                                                            <Send className="mr-2 h-4 w-4" />
                                                            Şifre Sıfırlama Maili Gönder
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {userData.role === 'beklemede' && (
                                                            <DropdownMenuItem onSelect={() => handleUpdateRole(userData.id, 'teacher')}>
                                                                <UserCheck className="mr-2 h-4 w-4" />
                                                                Öğretmen Olarak Onayla
                                                            </DropdownMenuItem>
                                                        )}
                                                        {userData.role === 'teacher' && (
                                                            <>
                                                                <DropdownMenuItem onSelect={() => handleUpdateRole(userData.id, 'beklemede')}>
                                                                    <UserX className="mr-2 h-4 w-4" />
                                                                    Onayı Kaldır
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => handleUpdateRole(userData.id, 'admin')}>
                                                                    <UserCog className="mr-2 h-4 w-4" />
                                                                    Admin Yap
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {userData.role === 'admin' && userData.id !== user?.uid && (
                                                            <DropdownMenuItem onSelect={() => handleUpdateRole(userData.id, 'teacher')}>
                                                                <User className="mr-2 h-4 w-4" />
                                                                Admin Rolünü Al
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className='text-destructive focus:bg-destructive/10 focus:text-destructive' onSelect={() => openDeleteConfirm(userData)}>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Kullanıcıyı Sil
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : (
                                                <span className='text-xs text-muted-foreground pr-4'>-</span>
                                            )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>

        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                    Bu işlem geri alınamaz. "{selectedUser?.fullName}" adlı kullanıcının veritabanı kaydını kalıcı olarak sileceksiniz.
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
