
'use client';

import * as React from 'react';
import { useTransition } from 'react';
import {
  FileText,
  Calendar as CalendarIcon,
  Users,
  UserCheck,
  UserX,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Loader2,
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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { classes, students as allStudents } from '@/lib/mock-data';
import type { Student, DailyRecord, AttendanceStatus, ClassInfo } from '@/lib/types';
import { statusOptions } from '@/lib/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { generateDescriptionAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';


export default function GunlukTakipPage() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = React.useState<ClassInfo>(classes[0]);
  const [recordDate, setRecordDate] = React.useState<Date>(new Date());
  const [isPending, startTransition] = useTransition();

  const initialRecords: Record<string, DailyRecord> = allStudents
    .filter(s => s.classId === selectedClass.id)
    .reduce((acc, student) => {
        acc[student.id] = { studentId: student.id, status: null, description: '' };
        return acc;
    }, {} as Record<string, DailyRecord>);
  
  initialRecords['s1'].status = '+';
  initialRecords['s1'].description = 'Derse aktif katıldı.';
  initialRecords['s3'].status = '-';
  initialRecords['s3'].description = 'Ödevini yapmamış.';
  initialRecords['s5'].status = 'Y';
  
  const [records, setRecords] = React.useState<Record<string, DailyRecord>>(initialRecords);

  const students = allStudents.filter((s) => s.classId === selectedClass.id);

  const handleRecordChange = (studentId: string, newRecord: Partial<DailyRecord>) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        status: newRecord.status !== undefined ? newRecord.status : prev[studentId]?.status,
        description: newRecord.description !== undefined ? newRecord.description : prev[studentId]?.description,
      },
    }));
  };

  const handleAllStatusChange = (status: AttendanceStatus) => {
    const newRecords = { ...records };
    students.forEach(student => {
      newRecords[student.id] = {
        ...newRecords[student.id],
        status: status
      };
    });
    setRecords(newRecords);
  }

  const handleGenerateDescription = (studentId: string) => {
    startTransition(async () => {
        const result = await generateDescriptionAction({
            studentId: studentId,
            classId: selectedClass.id,
            recordDate: format(recordDate, 'yyyy-MM-dd'),
        });

        if (result.error) {
            toast({
                title: 'Hata',
                description: result.error,
                variant: 'destructive',
            });
        } else if (result.description) {
            handleRecordChange(studentId, { description: result.description });
            toast({
                title: 'Açıklama Oluşturuldu',
                description: 'AI açıklaması başarıyla eklendi.',
            });
        }
    });
  };

  const getCounts = React.useCallback(() => {
    const counts = {
      present: 0,
      absent: 0,
      positive: 0,
      negative: 0,
    };

    students.forEach(student => {
      const record = records[student.id];
      if (record?.status) {
        if (['+', '½', 'G'].includes(record.status)) {
          counts.present++;
        }
        if (record.status === 'Y') {
          counts.absent++;
        }
        if (record.status === '+') {
          counts.positive++;
        }
        if (record.status === '-') {
          counts.negative++;
        }
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
    });
  };

  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className='flex-1'>
            <h1 className="text-2xl font-semibold">{selectedClass.name} - Öğrenci Değerlendirme</h1>
            <p className="text-muted-foreground">{format(recordDate, 'dd MMMM yyyy, cccc', { locale: tr })}</p>
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
              <CardTitle className="text-sm font-medium">Gelen Öğrenci</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.present}</div>
              <p className="text-xs text-muted-foreground">Toplam {students.length} öğrenciden</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gelmeyen Öğrenci</CardTitle>
              <UserX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.absent}</div>
               <p className="text-xs text-muted-foreground">Toplam {students.length} öğrenciden</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Artı</CardTitle>
              <ThumbsUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.positive}</div>
               <p className="text-xs text-muted-foreground">Bugün verilen</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Eksi</CardTitle>
              <ThumbsDown className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.negative}</div>
              <p className="text-xs text-muted-foreground">Bugün verilen</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Değerlendirme Tablosu</CardTitle>
              <Button onClick={handleSave}>
                <FileText className="mr-2 h-4 w-4" />
                Değişiklikleri Kaydet
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="w-full overflow-x-auto rounded-lg border">
                 <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="w-[50px] text-center">No</TableHead>
                            <TableHead className="min-w-[150px]">Ad Soyad</TableHead>
                             {statusOptions.map(option => (
                                <TableHead key={option.value} className="w-[120px] text-center">
                                   <div className='flex flex-col items-center gap-2'>
                                        <div className='flex items-center gap-1.5'>
                                            {option.icon && <option.icon className={cn("h-5 w-5", option.color)} />}
                                            <span>{option.label}</span>
                                        </div>
                                        <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => handleAllStatusChange(option.value)}>
                                            Tümü
                                        </Button>
                                   </div>
                                </TableHead>
                            ))}
                            <TableHead className="w-full min-w-[250px]">Açıklama</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map(student => {
                            const record = records[student.id];
                            const rowColorClass = {
                                '+': 'bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/40',
                                '½': 'bg-green-50/70 dark:bg-green-900/20 hover:bg-green-100/80 dark:hover:bg-green-900/30',
                                '-': 'bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40',
                                'Y': 'bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/40',
                                'G': 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40',
                            }[record?.status!] || 'hover:bg-muted/50';

                            return (
                                <TableRow key={student.id} className={cn("transition-colors", rowColorClass)}>
                                    <TableCell className="text-center text-muted-foreground font-medium">{student.studentNumber}</TableCell>
                                    <TableCell>{student.firstName} {student.lastName}</TableCell>
                                    
                                     <RadioGroup
                                        value={record?.status || ''}
                                        onValueChange={(value) => handleRecordChange(student.id, { status: value as AttendanceStatus })}
                                        className="contents"
                                    >
                                        {statusOptions.map(option => (
                                            <TableCell key={option.value} className="text-center">
                                                 <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <RadioGroupItem value={option.value} id={`${student.id}-${option.value}`} />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{option.label}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                        ))}
                                    </RadioGroup>

                                    <TableCell>
                                        <div className="relative">
                                             <Textarea
                                                placeholder="Öğrenci hakkında bir not ekleyin..."
                                                value={record?.description || ''}
                                                onChange={(e) => handleRecordChange(student.id, { description: e.target.value })}
                                                className="min-h-[60px] bg-card/80 pr-24"
                                                rows={2}
                                            />
                                            <Button variant="ghost" size="sm" onClick={() => handleGenerateDescription(student.id)} disabled={isPending} className="absolute top-1 right-1 h-auto px-2 py-1 text-xs self-start gap-1">
                                                {isPending && records[student.id]?.description === '' ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <Sparkles className="h-3 w-3 text-primary" />
                                                )}
                                                <span>AI Not</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                 </Table>
             </div>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
