
'use client';

import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function AyarlarPage() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Ayarlar</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Hesap Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Profil bilgilerinizi, bildirim tercihlerinizi ve diğer uygulama ayarlarını buradan yönetebilirsiniz. Bu bölüm yakında aktif olacaktır.
            </p>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
