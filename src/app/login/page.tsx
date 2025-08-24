
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = (event: React.FormEvent) => {
        event.preventDefault();
        // TODO: Implement actual login logic
        router.push('/anasayfa');
    }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950 px-4">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col justify-center">
            <div className="mb-8 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                    <GraduationCap className="h-10 w-10 text-primary" />
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50">SınıfPlanım</h1>
                </div>
                <p className="text-xl text-gray-600 dark:text-gray-400">Öğretmenin Dijital Asistanı</p>
                <p className="mt-2 text-gray-500 dark:text-gray-500">Günlük takip, raporlama ve planlama işlemlerinizi tek yerden yönetin.</p>
            </div>
            <div className="hidden md:block">
                <img 
                    src="https://placehold.co/600x400.png" 
                    alt="Okul İllüstrasyonu" 
                    className="rounded-lg object-cover w-full h-auto"
                    data-ai-hint="classroom teaching"
                 />
            </div>
        </div>
        <div className="flex items-center justify-center">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Hoş Geldiniz!</CardTitle>
                    <CardDescription>Devam etmek için bilgilerinizi girin.</CardDescription>
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
                    <Link href="/kayit" className="underline font-semibold">
                    Kayıt Olun
                    </Link>
                </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
