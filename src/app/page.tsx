'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar as CalendarIcon, FileDown, Save, ChevronsRight, Filter as FilterIcon, Home, Users, Settings, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { classes, students as allStudents } from '@/lib/mock-data';
import type { DailyRecord, Student, AttendanceStatus } from '@/lib/types';
import StudentAttendanceTable from '@/components/student-attendance-table';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ClassPlanPage() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState(classes[0].id);
  const [date, setDate] = useState<Date>(new Date());
  const [records, setRecords] = useState<Record<string, DailyRecord>>({});
  const [filter, setFilter] = useState<AttendanceStatus | 'all'>('all');

  const students = allStudents.filter((s) => s.classId === selectedClass);
  
  const handleRecordChange = (studentId: string, newRecord: Partial<DailyRecord>) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        status: prev[studentId]?.status ?? null,
        description: prev[studentId]?.description ?? '',
        ...newRecord,
      },
    }));
  };

  const handleSave = () => {
    console.log('Saving records:', {
      classId: selectedClass,
      date: format(date, 'yyyy-MM-dd'),
      records,
    });
    toast({
      title: 'Başarılı!',
      description: 'Yoklama kayıtları başarıyla kaydedildi.',
      variant: 'default',
    });
  };
  
  const handleBulkAction = (status: AttendanceStatus) => {
    const newRecords: Record<string, DailyRecord> = {};
    students.forEach(student => {
        newRecords[student.id] = {
            studentId: student.id,
            status,
            description: records[student.id]?.description || '',
        };
    });
    setRecords(prev => ({...prev, ...newRecords}));
    toast({
        title: "Toplu İşlem",
        description: `Tüm öğrenciler "${status}" olarak işaretlendi.`
    })
  }

  const summary = useMemo(() => {
    const counts: Record<string, number> = { '+': 0, '-': 0, 'G': 0, 'Y': 0, 'A': 0, 'unmarked': 0, '½': 0};
    students.forEach(s => {
        const status = records[s.id]?.status;
        if (status) {
            counts[status]++;
        } else {
            counts['unmarked']++;
        }
    });
    return counts;
  }, [records, students]);

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col">
        <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader className="p-4 justify-center flex">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
                Sınıf<span className="text-primary">Planım</span>
              </h1>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                  <SidebarGroup>
                      <SidebarGroupLabel>Menü</SidebarGroupLabel>
                      <SidebarMenuItem>
                          <SidebarMenuButton isActive tooltip="Anasayfa"><Home/> Anasayfa</SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                          <SidebarMenuButton tooltip="Sınıflarım"><Users/> Sınıflarım</SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                          <SidebarMenuButton tooltip="Ayarlar"><Settings/> Ayarlar</SidebarMenuButton>
                      </SidebarMenuItem>
                  </SidebarGroup>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <div className="flex items-center gap-3 p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src="https://placehold.co/40x40.png" alt="Öğretmen Adı" data-ai-hint="teacher portrait" />
                        <AvatarFallback>ÖA</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="font-semibold text-sm">Öğretmen Adı</span>
                        <span className="text-xs text-muted-foreground">Branş</span>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <SidebarTrigger className="sm:hidden" />
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                      Hoş Geldiniz, Öğretmen Adı
                    </h1>
                    <p className="text-sm text-muted-foreground">Bugün {students.length} öğrenciyi takip ediyorsunuz.</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Kaydet</Button>
                </div>
            </header>
            <SidebarInset>
              <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Sınıf</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sınıf Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tarih</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !date && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, 'PPP', { locale: tr }) : <span>Tarih seçin</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => setDate(d || new Date())}
                            initialFocus
                            locale={tr}
                          />
                        </PopoverContent>
                      </Popover>
                    </CardContent>
                  </Card>
                  <Card className="col-span-1 md:col-span-2">
                      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">Hızlı İşlemler</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex flex-wrap items-center justify-start gap-2">
                        <Button size="sm" variant="outline"><FileDown className="mr-2 h-4 w-4" /> PDF Aktar</Button>
                        <Button size="sm" variant="outline"><FileDown className="mr-2 h-4 w-4" /> Excel Aktar</Button>
                        <Button size="sm" variant="secondary" onClick={() => handleBulkAction('+')}><ChevronsRight className="mr-2 h-4 w-4"/> Herkesi "+" yap</Button>
                      </CardContent>
                  </Card>
                </div>

                <Card>
                    <CardHeader className="p-4 border-b">
                      <div className="flex flex-wrap items-center gap-2">
                          <FilterIcon className="h-5 w-5 text-muted-foreground"/>
                          <h3 className="text-sm font-semibold text-muted-foreground">Filtrele:</h3>
                          <Button variant={filter === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>Tümü</Button>
                          <Button variant={filter === '+' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('+')}>Artı (+)</Button>
                          <Button variant={filter === '½' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('½')}>Yarım Artı (½)</Button>
                          <Button variant={filter === '-' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('-')}>Eksi (-)</Button>
                          <Button variant={filter === 'Y' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('Y')}>Yok (Y)</Button>
                          <Button variant={filter === 'G' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('G')}>Mazeretli (G)</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <StudentAttendanceTable 
                          students={students}
                          records={records}
                          onRecordChange={handleRecordChange}
                          filter={filter}
                          classId={selectedClass}
                          recordDate={format(date, 'yyyy-MM-dd')}
                      />
                    </CardContent>
                    <div className="p-4 border-t text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-2">
                        <span>Artı: <strong className="text-foreground">{summary['+']}</strong></span>
                        <span>Yarım Artı: <strong className="text-foreground">{summary['½']}</strong></span>
                        <span>Eksi: <strong className="text-foreground">{summary['-']}</strong></span>
                        <span>Yok: <strong className="text-foreground">{summary['Y']}</strong></span>
                        <span>Mazeretli: <strong className="text-foreground">{summary['G']}</strong></span>
                        <span>İşaretlenmemiş: <strong className="text-foreground">{summary.unmarked}</strong></span>
                        <span className="ml-auto font-medium">Toplam Öğrenci: <strong className="text-foreground">{students.length}</strong></span>
                    </div>
                </Card>
              </main>
            </SidebarInset>
        </div>
      </div>
    </TooltipProvider>
  );
}
