
'use client';

import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Bell, BellRing, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-notifications';
import AppLayout from '@/components/app-layout';
import AuthGuard from '@/components/auth-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function NotificationsPageContent() {
  const { user } = useAuth();
  const { notifications, isLoading, markAsRead } = useNotifications(user?.uid);

  React.useEffect(() => {
    // When the component mounts, mark all currently unread notifications as read.
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length > 0) {
      markAsRead(unreadIds);
    }
    // We only want this to run when the component mounts and notifications are loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);


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
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Bell className="h-8 w-8 text-primary" />
                Bildirimler
            </h2>
            <p className="text-muted-foreground">
              Yönetici tarafından gönderilen en son duyurular.
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
                            notification.isRead ? "border-transparent bg-card/50" : "border-primary/20 bg-primary/5"
                        )}
                    >
                        <CardHeader className='pb-4'>
                            <div className="flex items-start justify-between gap-4">
                               <div className='flex items-center gap-3'>
                                 <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                                    notification.isRead ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'
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
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground ml-12 pl-1 border-l border-border">{notification.body}</p>
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
