
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
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
    { href: '/', label: 'Ana Sayfa', icon: Home },
    { href: '/gunluk-takip', label: 'Günlük Takip', icon: Users },
    { href: '/siniflarim', label: 'Sınıflarım', icon: GraduationCap },
    { href: '/raporlar', label: 'Raporlar', icon: BarChart },
    { href: '/planlarim', label: 'Planlarım', icon: Calendar },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="p-0">
          <button
            onClick={toggleSidebar}
            className="flex h-[60px] w-full flex-row items-center gap-2 p-4 justify-start hover:bg-sidebar-accent transition-colors duration-200"
          >
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-primary rounded-lg p-2 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  SınıfPlanım
                </h1>
                <p className="text-xs text-muted-foreground">Öğretmenin Dijital Asistanı</p>
              </div>
            </Link>
          </button>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem className="group-data-[collapsible=icon]:my-2">
              <div className="flex items-center gap-3 p-2 w-full group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src="https://placehold.co/40x40.png"
                    alt="Ayşe Öğretmen"
                    data-ai-hint="teacher portrait"
                  />
                  <AvatarFallback>AÖ</AvatarFallback>
                </Avatar>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                  <span className="font-semibold text-sm">Ayşe Öğretmen</span>
                  <span className="text-xs text-muted-foreground">Matematik</span>
                </div>
              </div>
            </SidebarMenuItem>
            <SidebarGroup className="mt-4">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton asChild tooltip={item.label} isActive={pathname === item.href}>
                        <a>
                            <item.icon /> <span>{item.label}</span>
                        </a>
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
                    <SidebarMenuButton asChild tooltip="Ayarlar" isActive={pathname.startsWith('/ayarlar')}>
                       <a>
                        <Settings /> <span>Ayarlar</span>
                       </a>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <div className="flex flex-col sm:pl-[var(--sidebar-width-icon)] group-data-[state=expanded]:sm:pl-[var(--sidebar-width)] transition-[padding-left] duration-200">
        {children}
      </div>
    </div>
  );
}
