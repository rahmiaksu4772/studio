
'use client';

import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Upload } from 'lucide-react';

export default function PlanlarimPage() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Planlarım</h1>
            <p className="text-muted-foreground">
              Yıllık ve günlük ders planlarınızı buradan yönetin.
            </p>
          </div>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Plan Yükle
          </Button>
        </div>
        <Card className="flex-1 flex items-center justify-center min-h-[50vh] border-dashed">
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Henüz Plan Oluşturulmadı</h2>
                <p className="text-muted-foreground mb-4">
                Yeni bir ders planı yükleyerek başlayın.
                </p>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Plan Yükle
                </Button>
            </div>
        </Card>
      </main>
    </AppLayout>
  );
}
