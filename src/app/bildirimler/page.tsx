
'use client';

import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Bell, BellRing, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-notifications';
import AppLayout from '@/components/app-layout';
import AuthGuard from '@/components/auth-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { deleteNotificationAction } from '../admin/actions';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


function NotificationsPageContent() {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid);
  const { notifications, isLoading, markAsRead, setNotifications } = useNotifications(user?.uid);
  const { toast } = useToast();

  React.useEffect(() => {
    // For non-admins, mark notifications as read on visit.
    if (profile?.role !== 'admin') {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        if (unreadIds.length > 0) {
        markAsRead(unreadIds);
        }
    }
    // We only want this to run when the component mounts and notifications are loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, profile?.role]);

  const handleDeleteNotification = async (notificationId: string) => {
    const result = await deleteNotificationAction(notificationId);
    if (result.success) {
        toast({ title: 'Başarılı!', description: result.message, variant: 'destructive'});
        // Optimistically update the UI
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } else {
        toast({ title: 'Hata!', description: result.message, variant: 'destructive'});
    }
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
  
  const pageTitle = profile?.role === 'admin' ? "Gönderilen Duyurular" : "Bildirimler";
  const pageDescription = profile?.role === 'admin' 
    ? "Tüm kullanıcılara gönderdiğiniz duyuruları buradan yönetebilirsiniz."
    : "Yönetici tarafından gönderilen en son duyurular.";

  return (
    <AppLayout>
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Bell className="h-8 w-8 text-primary" />
                {pageTitle}
            </h2>
            <p className="text-muted-foreground">
              {pageDescription}
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
            {notifications.length > 0 ? (
                notifications.map(notification => (
                    <Card 
                        key={notification.id}
                        className={cn(
                            "transition-all",
                            profile?.role !== 'admin' && (notification.isRead ? "border-transparent bg-card/50" : "border-primary/20 bg-primary/5")
                        )}
                    >
                        <CardHeader className='pb-4'>
                            <div className="flex items-start justify-between gap-4">
                               <div className='flex items-center gap-3'>
                                 <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                                    profile?.role === 'admin' ? 'bg-muted text-muted-foreground' : (notification.isRead ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground')
                                 )}>
                                    <BellRing className="h-5 w-5" />
                                 </div>
                                 <div>
                                    <CardTitle className='text-base leading-tight'>{notification.title}</CardTitle>
                                     <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: tr })}
                                    </p>
                                 </div>
                               </div>
                               {profile?.role === 'admin' && (
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className='text-destructive/70 hover:text-destructive'>
                                            <Trash2 className='h-4 w-4' />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Bu Duyuruyu Silmek İstediğinizden Emin misiniz?</AlertDialogTitle>
                                            <AlertDialogDescription>Bu işlem geri alınamaz. Duyuru tüm kullanıcılardan ve sistemden kalıcı olarak silinecektir.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>İptal</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteNotification(notification.id)} className="bg-destructive hover:bg-destructive/90">Evet, Sil</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                               )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground ml-12 pl-1 border-l border-border space-y-4">
                                <p>{notification.body}</p>
                                {profile?.role === 'admin' && notification.author && (
                                     <div className='flex items-center gap-2 text-xs pt-2 border-t'>
                                        <Avatar className='h-5 w-5'>
                                            <AvatarImage src={notification.author.avatarUrl} data-ai-hint="teacher portrait" />
                                            <AvatarFallback>{notification.author.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>Gönderen: <strong>{notification.author.name}</strong></span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                     <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Henüz bildirim yok</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Yöneticiniz yeni bir duyuru gönderdiğinde burada görünecektir.
                    </p>
                </div>
            )}
        </div>
      </main>
    </AppLayout>
  );
}


export default function NotificationsPage() {
    return (
        <AuthGuard>
            <NotificationsPageContent />
        </AuthGuard>
    )
}
