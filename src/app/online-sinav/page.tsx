
'use client';

import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FilePenLine, Construction } from 'lucide-react';

export default function OnlineSinavPage() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Online Sınav Modülü</h1>
            <p className="text-muted-foreground">
              Öğrencileriniz için online sınavlar oluşturun, yayınlayın ve sonuçları takip edin.
            </p>
          </div>
        </div>
        
        <Card className="flex items-center justify-center min-h-[60vh] border-dashed">
            <div className="text-center p-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Construction className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Çok Yakında!</h2>
                <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                    Bu özellik şu anda geliştirme aşamasındadır. En kısa sürede hizmetinizde olacaktır.
                </p>
            </div>
        </Card>
      </main>
    </AppLayout>
  );
}
