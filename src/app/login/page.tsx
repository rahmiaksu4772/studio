
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = (event: React.FormEvent) => {
        event.preventDefault();
        // TODO: Implement actual login logic
        router.push('/anasayfa');
    }

  return (
    <div className="flex h-screen items-center justify-center">
       <Card className="mx-auto max-w-sm">
        <CardHeader>
            <CardTitle className="text-2xl">Giriş Yap</CardTitle>
            <CardDescription>Devam etmek için e-posta ve şifrenizi girin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" type="email" placeholder="ornek@mail.com" required defaultValue="rahmi.aksu.47@gmail.com" />
            </div>
            <div className="grid gap-2">
                <div className="flex items-center">
                    <Label htmlFor="password">Şifre</Label>
                    <Link href="#" className="ml-auto inline-block text-sm underline">
                        Şifrenizi mi unuttunuz?
                    </Link>
                </div>
                <Input id="password" type="password" required defaultValue="password123" />
            </div>
            <Button type="submit" className="w-full">
              Giriş Yap
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Hesabınız yok mu?{' '}
            <Link href="/kayit" className="underline">
              Kayıt Olun
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
