
'use client';

import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function AdminPage() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Admin Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Okul yönetimi ve diğer admin özellikleri burada yer alacak.
            </p>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
