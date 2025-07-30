
'use client';

import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function KodlarPage() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Erişim Kodları</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Öğrenci ve Veli Erişim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
             Öğrencilerin ve velilerin sisteme erişimi için gerekli kodları buradan oluşturup yönetebilirsiniz. Bu özellik yakında eklenecektir.
            </p>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
