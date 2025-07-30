
'use client';

import * as React from 'react';
import {
  FileText,
  Calendar as CalendarIcon,
  UserCheck,
  UserX,
  CircleSlash,
  ThumbsDown,
  ThumbsUp,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { classes, students as allStudents } from '@/lib/mock-data';
import type { Student, DailyRecord, AttendanceStatus, ClassInfo } from '@/lib/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentAttendanceTable from '@/components/student-attendance-table';
import { useToast } from '@/hooks/use-toast';

export default function GunlukTakipPage() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = React.useState<ClassInfo>(classes[0]);
  const [recordDate, setRecordDate] = React.useState<Date>(new Date());
  
  // Initialize records from mock data or empty
  const initialRecords: Record<string, DailyRecord> = {
    's1': { studentId: 's1', status: '+', description: 'Derse aktif katıldı.' },
    's3': { studentId: 's3', status: '-', description: 'Ödevini yapmamış.' },
    's5': { studentId: 's5', status: 'Y', description: '' },
  };

  const [records, setRecords] = React.useState<Record<string, DailyRecord>>(initialRecords);
  const [filter, setFilter] = React.useState<AttendanceStatus | 'all' | 'unmarked'>('all');

  const students = allStudents.filter((s) => s.classId === selectedClass.id);

  const handleRecordChange = (studentId: string, newRecord: Partial<DailyRecord>) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        status: newRecord.status !== undefined ? newRecord.status : prev[studentId]?.status ?? null,
        description: newRecord.description !== undefined ? newRecord.description : prev[studentId]?.description ?? '',
      },
    }));
  };
  
  const getCounts = React.useCallback(() => {
    const counts = {
        total: students.length,
        marked: 0,
        unmarked: 0,
        present: 0,
        absent: 0,
    };
    
    students.forEach(student => {
        const record = records[student.id];
        if (record?.status) {
            counts.marked++;
            if (['+', '½', 'G'].includes(record.status)) {
                counts.present++;
            } else if (record.status === 'Y') {
                counts.absent++;
            }
        } else {
            counts.unmarked++;
        }
    });

    return counts;
  }, [students, records]);

  const counts = getCounts();

  const handleSave = () => {
    console.log("Kaydedilen Veriler:", records);
    toast({
        title: "Kayıt Başarılı",
        description: `${selectedClass.name} sınıfı için ${format(recordDate, 'dd MMMM yyyy')} tarihli kayıtlar kaydedildi.`,
    })
  }

  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className='flex-1'>
                 <h1 className="text-2xl font-semibold">Günlük Takip</h1>
                 <p className="text-muted-foreground">Öğrenci katılımlarını ve gözlemlerinizi buradan yönetin.</p>
            </div>
            <div className="flex items-center gap-4">
                <Select
                    value={selectedClass.id}
                    onValueChange={(classId) => {
                        const newClass = classes.find(c => c.id === classId);
                        if (newClass) setSelectedClass(newClass);
                    }}
                    >
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Sınıf Seç" />
                    </SelectTrigger>
                    <SelectContent>
                        {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>{format(recordDate, 'dd MMMM yyyy', { locale: tr })}</span>
                 </Button>
            </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{counts.total}</div>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gelen Öğrenci</CardTitle>
                    <UserCheck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{counts.present}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gelmeyen Öğrenci</CardTitle>
                    <UserX className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{counts.absent}</div>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">İşaretlenmemiş</CardTitle>
                    <CircleSlash className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{counts.unmarked}</div>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader className="flex-row items-center justify-between p-4">
                 <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
                    <TabsList>
                        <TabsTrigger value="all">Tümü</TabsTrigger>
                        <TabsTrigger value="unmarked">İşaretlenmemiş</TabsTrigger>
                        <TabsTrigger value="+" className="flex items-center gap-2"><ThumbsUp className="h-4 w-4"/> Artı</TabsTrigger>
                        <TabsTrigger value="-" className="flex items-center gap-2"><ThumbsDown className="h-4 w-4"/> Eksi</TabsTrigger>
                        <TabsTrigger value="Y" className="flex items-center gap-2"><UserX className="h-4 w-4"/> Yok</TabsTrigger>
                        <TabsTrigger value="G" className="flex items-center gap-2"><UserCheck className="h-4 w-4"/> Mazeretli</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button onClick={handleSave}>
                    <FileText className="mr-2 h-4 w-4" />
                    Değişiklikleri Kaydet
                </Button>
            </CardHeader>
            <CardContent className="p-0">
               <StudentAttendanceTable
                students={students}
                records={records}
                onRecordChange={handleRecordChange}
                filter={filter}
                classId={selectedClass.id}
                recordDate={format(recordDate, 'yyyy-MM-dd')}
              />
            </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
