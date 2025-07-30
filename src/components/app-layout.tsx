
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  BarChart,
  Calendar,
  GraduationCap,
  Settings,
  Home,
  PanelLeft,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const menuItems = [
    { href: '/', label: 'Ana Sayfa', icon: Home },
    { href: '/gunluk-takip', label: 'Günlük Takip', icon: Users },
    { href: '/siniflarim', label: 'Sınıflarım', icon: GraduationCap },
    { href: '/raporlar', label: 'Raporlar', icon: BarChart },
    { href: '/planlarim', label: 'Planlarım', icon: Calendar },
];

function AppSidebar() {
    const pathname = usePathname();
    const { state } = useSidebar();
    
    return (
        <Sidebar>
            <SidebarHeader className="flex h-[60px] items-center justify-between p-4">
                <div className="flex items-center gap-3 w-full">
                    <div className="bg-primary rounded-lg p-2 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className={cn("flex flex-col", state === 'collapsed' && 'hidden')}>
                        <h1 className="text-lg font-semibold tracking-tight text-sidebar-foreground">
                        SınıfPlanım
                        </h1>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="p-2">
            <SidebarMenu>
                <SidebarMenuItem>
                <div className={cn("flex items-center gap-3 p-2 w-full", state === 'collapsed' && 'justify-center')}>
                    <Avatar className="h-10 w-10">
                    <AvatarImage
                        src="https://placehold.co/40x40.png"
                        alt="Ayşe Öğretmen"
                        data-ai-hint="teacher portrait"
                    />
                    <AvatarFallback>AÖ</AvatarFallback>
                    </Avatar>
                    <div className={cn("flex flex-col", state === 'collapsed' && 'hidden')}>
                    <span className="font-semibold text-sm">Ayşe Öğretmen</span>
                    <span className="text-xs text-sidebar-foreground/70">Matematik</span>
                    </div>
                </div>
                </SidebarMenuItem>
                <SidebarGroup className="mt-4">
                {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                        <SidebarMenuButton tooltip={item.label} isActive={pathname === item.href}>
                            <item.icon /> <span className={cn(state === 'collapsed' && 'hidden')}>{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                    </SidebarMenuItem>
                ))}
                </SidebarGroup>
            </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-2">
            <SidebarMenu>
                <SidebarMenuItem>
                    <Link href="/ayarlar">
                        <SidebarMenuButton tooltip="Ayarlar" isActive={pathname.startsWith('/ayarlar')}>
                        <Settings /> <span className={cn(state === 'collapsed' && 'hidden')}>Ayarlar</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

function MobileHeader() {
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:hidden">
            <SidebarTrigger className="sm:hidden" />
            <div className="flex items-center gap-2">
                 <div className="bg-primary rounded-md p-1.5 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-md font-semibold tracking-tight">
                    SınıfPlanım
                </h1>
            </div>
        </header>
    )
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isMobile } = useSidebar();
  
  if (isMobile === undefined) {
      return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
        <AppSidebar />
        <div className="flex flex-col flex-1">
            <header className="hidden sm:flex h-14 items-center gap-4 border-b bg-background px-4">
                <SidebarTrigger />
            </header>
            <MobileHeader />
            {children}
        </div>
    </div>
  );
}
