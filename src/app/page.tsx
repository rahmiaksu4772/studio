'use client';

import * as React from 'react';
import {
  Home,
  Users,
  BarChart,
  Calendar,
  FileText,
  Shield,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
import { TooltipProvider } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClassPlanPage() {
  const { toast } = useToast();

  return (
    <TooltipProvider>
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
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Ana Panel">
                    <Home /> Ana Panel
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Sınıflarım">
                    <GraduationCap /> Sınıflarım
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Günlük Takip">
                    <Users /> Günlük Takip
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Raporlar">
                    <BarChart /> Raporlar
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Planlarım">
                    <Calendar /> Planlarım
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Erişim Kodları">
                    <FileText /> Erişim Kodları
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Admin Panel">
                    <Shield /> Admin Panel
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarGroup>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Ayarlar"><Settings/> Ayarlar</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col sm:pl-[5.5rem] group-data-[state=expanded]:sm:pl-[18rem] transition-[padding-left] duration-200">
           <main className="flex-1 p-4 sm:p-6">
            <Card className="bg-primary text-primary-foreground border-0 shadow-lg">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Hoş Geldiniz, Ayşe Öğretmen! 👋</h1>
                        <p className="text-primary-foreground/80 mt-1">30 Temmuz 2025, Çarşamba</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm">Bugün</p>
                        <p className="text-4xl font-bold">4</p>
                        <p className="text-sm">Ders</p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Öğrenci</CardTitle>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                           <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">5</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Aktif Sınıf</CardTitle>
                         <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                           <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">2</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Haftalık Katılım</CardTitle>
                         <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                           <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">95%</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Günlük Kayıt</CardTitle>
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                           <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">0</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="h-5 w-5"/>
                        Bugünkü Derslerim
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Bugün için planlanmış dersleriniz burada görünecektir.</p>
                </CardContent>
            </Card>

           </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
