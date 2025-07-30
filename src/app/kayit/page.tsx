
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react';

export default function KayitPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
       <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Hesap Oluşturun</CardTitle>
            <CardDescription>Başlamak için bilgilerinizi girin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="fullname">Ad Soyad</Label>
                <Input id="fullname" placeholder="Ayşe Yılmaz" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" type="email" placeholder="ornek@mail.com" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Hesap Oluştur
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Zaten bir hesabınız var mı?{' '}
            <Link href="/login" className="underline font-semibold text-primary">
              Giriş Yapın
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
