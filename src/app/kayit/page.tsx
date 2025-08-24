
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react';

export default function KayitPage() {
    const router = useRouter();

    const handleRegister = (event: React.FormEvent) => {
        event.preventDefault();
        // For this prototype, we'll just navigate to the dashboard after "registering".
        router.push('/anasayfa');
    };

  return (
     <div className="flex h-screen w-full items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleRegister}>
            <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-2 mb-2">
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">SınıfPlanım</h1>
                </div>
                <CardTitle className="text-2xl">Hesap Oluştur</CardTitle>
                <CardDescription>
                Başlamak için bilgilerinizi girin.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="fullName">Ad Soyad</Label>
                    <Input id="fullName" placeholder="Ayşe Yılmaz" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input id="email" type="email" placeholder="ornek@mail.com" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Şifre</Label>
                    <Input id="password" type="password" required />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" type="submit">
                    Kayıt Ol
                </Button>
                 <p className="text-center text-sm text-muted-foreground">
                    Zaten bir hesabınız var mı?{' '}
                    <Link
                    href="/login"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                    Giriş Yapın
                    </Link>
                </p>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
