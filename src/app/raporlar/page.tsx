
'use client';

import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from 'lucide-react';

export default function RaporlarPage() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart className="h-5 w-5" />
              Raporlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Bireysel ve sınıf raporları burada yer alacak.
            </p>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
