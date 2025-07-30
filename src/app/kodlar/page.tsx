
'use client';

import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function KodlarPage() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Erişim Kodları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Veli ve öğrenci erişim kodları yönetimi burada yer alacak.
            </p>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
