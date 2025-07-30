'use client';
import * as React from 'react';
import AppLayout from '@/components/app-layout';

// Redirect to gunluk-takip page by default
import { redirect } from 'next/navigation';

export default function HomePage() {
  React.useEffect(() => {
    redirect('/gunluk-takip');
  }, []);

  return (
    <AppLayout>
      <div className="flex-1 p-4 sm:p-6 flex items-center justify-center">
        <p>Yönlendiriliyor...</p>
      </div>
    </AppLayout>
  );
}
