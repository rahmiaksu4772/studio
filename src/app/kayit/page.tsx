
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function KayitPage() {
  return (
    <div className="flex h-screen items-center justify-center">
       <Card className="mx-auto max-w-sm">
        <CardHeader>
            <CardTitle className="text-2xl">Hesap Oluşturun</CardTitle>
            <CardDescription>Başlamak için bilgilerinizi girin.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="fullname">Ad Soyad</Label>
                <Input id="fullname" placeholder="Ayşe Yılmaz" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" type="email" placeholder="ornek@mail.com" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Şifre</Label>
                <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Hesap Oluştur
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Zaten bir hesabınız var mı?{' '}
            <Link href="/login" className="underline">
              Giriş Yapın
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
