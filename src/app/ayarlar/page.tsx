
'use client';

import * as React from 'react';
import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Palette,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function AyarlarPage() {
  const [activeTheme, setActiveTheme] = React.useState('light');

  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ayarlar</h1>
            <p className="text-muted-foreground">
              Profil bilgilerinizi, görünüm ve bildirim tercihlerinizi yönetin.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            <div className='md:col-span-1 space-y-8'>
                 <Card>
                    <CardHeader>
                        <CardTitle>Profil</CardTitle>
                        <CardDescription>Temel hesap bilgileriniz.</CardDescription>
                    </CardHeader>
                    <CardContent className='text-center flex flex-col items-center gap-4'>
                         <Avatar className="h-24 w-24 border-2 border-primary/10">
                            <AvatarImage src="https://placehold.co/96x96.png" alt="Ayşe Öğretmen" data-ai-hint="teacher portrait" />
                            <AvatarFallback>AÖ</AvatarFallback>
                        </Avatar>
                        <div className='text-center'>
                            <h2 className="text-xl font-semibold">Ayşe Öğretmen</h2>
                            <p className="text-muted-foreground">Matematik Öğretmeni</p>
                        </div>
                        <Button variant='outline' className='w-full'>Profili Düzenle</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Güvenlik
                        </CardTitle>
                        <CardDescription>Şifre ve güvenlik ayarları.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <button className='w-full text-left p-4 rounded-lg border hover:bg-muted/50 transition-colors'>
                            <p className='font-medium'>Şifre Değiştir</p>
                            <p className='text-xs text-muted-foreground'>Son değişiklik: 30 gün önce</p>
                        </button>
                    </CardContent>
                </Card>
            </div>
          <div className="md:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Hesap Bilgileri</CardTitle>
                  <CardDescription>Kişisel bilgileriniz ve iletişim detaylarınız.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                      <User className="h-6 w-6 text-primary" />
                      <div>
                        <p className="text-muted-foreground">Ad Soyad</p>
                        <p className="font-semibold">Ayşe Öğretmen</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                      <Mail className="h-6 w-6 text-primary" />
                      <div>
                        <p className="text-muted-foreground">E-posta</p>
                        <p className="font-semibold">rahmi.aksu.47@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                      <Book className="h-6 w-6 text-primary" />
                      <div>
                        <p className="text-muted-foreground">Branş</p>
                        <p className="font-semibold">Matematik</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                      <MapPin className="h-6 w-6 text-primary" />
                      <div>
                        <p className="text-muted-foreground">Görev Yeri</p>
                        <p className="font-semibold">Atatürk İlkokulu</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Görünüm
                  </CardTitle>
                  <CardDescription>Uygulamanın arayüzünü kişiselleştirin.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-4">Tema Seçimi</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setActiveTheme('light')}
                      className={cn(
                        'p-4 rounded-lg border-2 cursor-pointer transition-all',
                        activeTheme === 'light'
                          ? 'border-primary ring-2 ring-primary/50 bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Monitor className="h-6 w-6" />
                        <h3 className="font-semibold text-lg">Açık Tema</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Gündüz kullanımı için aydınlık ve ferah arayüz.
                      </p>
                    </div>
                    <div
                      onClick={() => setActiveTheme('dark')}
                      className={cn(
                        'p-4 rounded-lg border-2 cursor-pointer transition-colors',
                        activeTheme === 'dark'
                          ? 'border-primary ring-2 ring-primary/50 bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Moon className="h-6 w-6" />
                        <h3 className="font-semibold text-lg">Koyu Tema</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Göz yormayan, gece kullanımı için ideal arayüz.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Bildirimler
                  </CardTitle>
                  <CardDescription>Hangi durumlarda bildirim almak istediğinizi seçin.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='flex items-center justify-between p-4 rounded-lg border'>
                        <div>
                            <Label htmlFor='notification-1' className='font-medium'>E-posta Bildirimleri</Label>
                            <p className='text-xs text-muted-foreground'>Haftalık özet raporları ve önemli duyurular.</p>
                        </div>
                        <Switch id='notification-1' defaultChecked/>
                    </div>
                     <div className='flex items-center justify-between p-4 rounded-lg border'>
                        <div>
                            <Label htmlFor='notification-2' className='font-medium'>Anlık Bildirimler</Label>
                            <p className='text-xs text-muted-foreground'>Uygulama içi önemli olaylar için anlık uyarılar.</p>
                        </div>
                        <Switch id='notification-2' />
                    </div>
                </CardContent>
              </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
