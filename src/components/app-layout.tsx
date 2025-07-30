
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  BarChart,
  Calendar,
  FileText,
  Shield,
  GraduationCap,
  Settings,
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
} from '@/components/ui/sidebar';

const menuItems = [
    { href: '/', label: 'Ana Panel', icon: Home },
    { href: '/siniflarim', label: 'Sınıflarım', icon: GraduationCap },
    { href: '/gunluk-takip', label: 'Günlük Takip', icon: Users },
    { href: '/raporlar', label: 'Raporlar', icon: BarChart },
    { href: '/planlarim', label: 'Planlarım', icon: Calendar },
    { href: '/kodlar', label: 'Erişim Kodları', icon: FileText },
    { href: '/admin', label: 'Admin Panel', icon: Shield },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="p-4 py-6 justify-start flex flex-col h-[140px] gap-2">
          <div className="flex items-center gap-3 w-full">
            <div className="bg-primary rounded-lg p-2 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                SınıfPlanım
              </h1>
              <p className="text-xs text-muted-foreground">Öğretmenin Dijital Asistanı</p>
            </div>
          </div>
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
                  <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
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
              <Link href="/hesabim" legacyBehavior passHref>
                <SidebarMenuButton asChild isActive={pathname === '/hesabim'} tooltip="Ayarlar">
                   <a>
                    <Settings /> <span>Ayarlar</span>
                   </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <div className="flex flex-col sm:pl-[5.5rem] group-data-[state=expanded]:sm:pl-[18rem] transition-[padding-left] duration-200">
        {children}
      </div>
    </div>
  );
}
