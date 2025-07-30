
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = (event: React.FormEvent) => {
        event.preventDefault();
        // TODO: Implement actual login logic
        router.push('/anasayfa');
    }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
       <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">SınıfPlanım Portal</CardTitle>
            <CardDescription>Devam etmek için giriş yapın.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" type="email" placeholder="ornek@mail.com" required defaultValue="rahmi.aksu.47@gmail.com" />
            </div>
            <div className="space-y-2">
                <div className="flex items-center">
                    <Label htmlFor="password">Şifre</Label>
                    <Link href="#" className="ml-auto inline-block text-xs underline">
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
            <Link href="/kayit" className="underline font-semibold text-primary">
              Kayıt Olun
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
