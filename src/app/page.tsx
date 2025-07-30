
'use client';

import AppLayout from '@/components/app-layout';
import DersProgrami from '@/components/ders-programi';

export default function HomePage() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6">
            <DersProgrami />
        </div>
      </main>
    </AppLayout>
  );
}
