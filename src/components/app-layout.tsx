
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Users,
    BarChart,
    Calendar,
    GraduationCap,
    Settings,
    Home,
    LogOut,
    Menu,
    StickyNote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const menuItems = [
    { href: '/anasayfa', label: 'Ana Sayfa', icon: Home },
    { href: '/gunluk-takip', label: 'Günlük Takip', icon: Users },
    { href: '/siniflarim', label: 'Sınıflarım', icon: GraduationCap },
    { href: '/raporlar', label: 'Raporlar', icon: BarChart },
    { href: '/planlarim', label: 'Planlarım', icon: Calendar },
    { href: '/notlarim', label: 'Notlarım', icon: StickyNote },
];

const handleLogout = (router: ReturnType<typeof useRouter>) => {
    // TODO: Implement actual logout logic
    router.push('/login');
}

const NavContent = React.memo(function NavContent() {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/anasayfa" className="flex items-center gap-2 font-semibold">
                    <GraduationCap className="h-6 w-6" />
                    <span className="">SınıfPlanım</span>
                </Link>
            </div>
            <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                                pathname === item.href ? 'bg-muted text-primary' : ''
                            }`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="mt-auto p-4">
                 <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    <Link
                        href="/ayarlar"
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                            pathname.startsWith('/ayarlar') ? 'bg-muted text-primary' : ''
                        }`}
                        >
                        <Settings className="h-4 w-4" />
                        Ayarlar
                    </Link>
                     <button
                        onClick={() => handleLogout(router)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                        >
                        <LogOut className="h-4 w-4" />
                        Çıkış Yap
                    </button>
                 </nav>
            </div>
        </div>
    )
});


export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Don't render layout for login/register pages
    if (pathname === '/login' || pathname === '/kayit') {
        return <>{children}</>;
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <NavContent />
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0">
                            <NavContent />
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        <div className="relative">
                            <Avatar className="float-right">
                                <AvatarImage src="https://placehold.co/40x40.png" alt="Ayşe Öğretmen" data-ai-hint="teacher portrait" />
                                <AvatarFallback>AÖ</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>
                {children}
            </div>
        </div>
    );
}
