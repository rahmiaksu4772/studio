
'use client';

import * as React from 'react';
import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Book,
  MapPin,
  Paintbrush,
  Monitor,
  Moon,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AyarlarPage() {
  const [activeTheme, setActiveTheme] = React.useState('light');

  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Hesabım</h1>
            <p className="text-muted-foreground">
              Profil bilgilerinizi ve tercihlerinizi yönetin
            </p>
          </div>
          <Button>Düzenle</Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <Avatar className="h-20 w-20">
                    <AvatarImage src="https://placehold.co/80x80.png" alt="Ayşe Öğretmen" data-ai-hint="teacher portrait" />
                    <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-xl font-semibold">Ayşe Öğretmen</h2>
                    <p className="text-muted-foreground">Matematik</p>
                    <p className="text-muted-foreground text-sm">Atatürk İlkokulu</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Ad Soyad</p>
                    <p className="font-medium">Ayşe Öğretmen</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">E-posta</p>
                    <p className="font-medium">rahmi.aksu.47@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Book className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Branş</p>
                    <p className="font-medium">Matematik</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Görev Yeri</p>
                    <p className="font-medium">Atatürk İlkokulu</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paintbrush className="h-5 w-5" />
                Görünüm Tercihleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium mb-2">Tema Seçimi</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setActiveTheme('light')}
                  className={cn(
                    'p-4 rounded-lg border-2 cursor-pointer transition-colors',
                    activeTheme === 'light'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <Monitor className="h-5 w-5" />
                    <h3 className="font-semibold">Açık Tema</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Gündüz kullanımı için ideal
                  </p>
                </div>
                <div
                  onClick={() => setActiveTheme('dark')}
                  className={cn(
                    'p-4 rounded-lg border-2 cursor-pointer transition-colors',
                    activeTheme === 'dark'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <Moon className="h-5 w-5" />
                    <h3 className="font-semibold">Koyu Tema</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Gece kullanımı için ideal
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Güvenlik
              </CardTitle>
            </CardHeader>
            <CardContent>
                <button className='w-full text-left p-4 rounded-lg border hover:bg-muted/50'>
                    <p className='font-medium'>Şifre Değiştir</p>
                    <p className='text-xs text-muted-foreground'>Son değişiklik: 30 gün önce</p>
                </button>
            </CardContent>
          </Card>

        </div>
      </main>
    </AppLayout>
  );
}
