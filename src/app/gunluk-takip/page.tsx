
'use client';

import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function GunlukTakipPage() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Günlük Takip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
             Öğrenci takip ve değerlendirme matrisi burada yer alacak.
            </p>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
