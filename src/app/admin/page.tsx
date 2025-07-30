
'use client';

import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function AdminPage() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Yönetim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Bu alan, uygulama genelindeki ayarları ve kullanıcı yönetimini yapmak için tasarlanmıştır. Geliştirme aşamasındadır.
            </p>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
