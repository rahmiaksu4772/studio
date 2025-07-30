
'use client';

import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload } from 'lucide-react';

export default function PlanlarimPage() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Planlarım</h1>
            <p className="text-muted-foreground">
              Yıllık ve haftalık planlarınızı yönetin
            </p>
          </div>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Plan Yükle
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Tüm Planlar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground/80" />
            </div>
            <h3 className="text-xl font-semibold">Henüz plan yüklenmemiş</h3>
            <p className="text-muted-foreground mt-1">
              İlk planınızı yükleyerek başlayın.
            </p>
            <Button className="mt-4">
                <Upload className="mr-2 h-4 w-4" />
                Plan Yükle
            </Button>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
