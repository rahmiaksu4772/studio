
'use client';

import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function PlanlarimPage() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Planlarım
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Yıllık plan, haftalık ders programı yönetimi burada yer alacak.
            </p>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
