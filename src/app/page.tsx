'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar as CalendarIcon, FileDown, Save, ChevronsRight, Filter as FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { classes, students as allStudents } from '@/lib/mock-data';
import type { DailyRecord, Student, AttendanceStatus } from '@/lib/types';
import StudentAttendanceTable from '@/components/student-attendance-table';

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
    // In a real app, this would send the `records` object to a server endpoint.
    console.log('Saving records:', {
      classId: selectedClass,
      date: format(date, 'yyyy-MM-dd'),
      records,
    });
    toast({
      title: 'Başarılı!',
      description: 'Yoklama kayıtları başarıyla kaydedildi.',
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
    const counts: Record<string, number> = { '+': 0, '-': 0, 'G': 0, 'Y': 0, 'A': 0, 'unmarked': 0};
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
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-8">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Sınıf<span className="text-primary">Planım</span>
          </h1>
          <p className="hidden text-sm text-muted-foreground md:block">Öğretmene Özel Dijital Takip Paneli</p>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Sınıf</h3>
              </div>
              <div className="p-4 pt-0">
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
              </div>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow">
               <div className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Tarih</h3>
              </div>
              <div className="p-4 pt-0">
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
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 rounded-xl border bg-card text-card-foreground shadow p-4 flex flex-wrap items-center justify-start gap-2">
                <Button size="sm" onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Tümünü Kaydet</Button>
                <Button size="sm" variant="outline"><FileDown className="mr-2 h-4 w-4" /> PDF Aktar</Button>
                <Button size="sm" variant="outline"><FileDown className="mr-2 h-4 w-4" /> Excel Aktar</Button>
                <Button size="sm" variant="secondary" onClick={() => handleBulkAction('+')}><ChevronsRight className="mr-2 h-4 w-4"/> Herkesi "+" yap</Button>
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-4 flex flex-wrap items-center gap-2 border-b">
                   <FilterIcon className="h-5 w-5 text-muted-foreground"/>
                   <h3 className="text-sm font-semibold text-muted-foreground">Filtrele:</h3>
                   <Button variant={filter === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('all')}>Tümü</Button>
                   <Button variant={filter === '+' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('+')}>Katıldı (+)</Button>
                   <Button variant={filter === '-' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('-')}>İzinsiz (-)</Button>
                   <Button variant={filter === 'G' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('G')}>Mazeretli (G)</Button>
                   <Button variant={filter === 'Y' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('Y')}>Yarım Gün (Y)</Button>
                   <Button variant={filter === 'A' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('A')}>Artılı (A)</Button>
              </div>
              <StudentAttendanceTable 
                  students={students}
                  records={records}
                  onRecordChange={handleRecordChange}
                  filter={filter}
                  classId={selectedClass}
                  recordDate={format(date, 'yyyy-MM-dd')}
              />
              <div className="p-4 border-t text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-2">
                  <span>Katıldı: <strong className="text-foreground">{summary['+']}</strong></span>
                  <span>İzinsiz: <strong className="text-foreground">{summary['-']}</strong></span>
                  <span>Mazeretli: <strong className="text-foreground">{summary['G']}</strong></span>
                  <span>Yarım Gün: <strong className="text-foreground">{summary['Y']}</strong></span>
                  <span>Artılı: <strong className="text-foreground">{summary['A']}</strong></span>
                  <span>İşaretlenmemiş: <strong className="text-foreground">{summary.unmarked}</strong></span>
                  <span className="ml-auto font-medium">Toplam Öğrenci: <strong className="text-foreground">{students.length}</strong></span>
              </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
