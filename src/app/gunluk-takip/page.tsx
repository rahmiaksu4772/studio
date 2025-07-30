
'use client';

import * as React from 'react';
import { useTransition } from 'react';
import {
  FileText,
  Calendar as CalendarIcon,
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
  const [generatingFor, setGeneratingFor] = React.useState<string | null>(null);

  const initialRecords: Record<string, DailyRecord> = allStudents
    .filter(s => s.classId === selectedClass.id)
    .reduce((acc, student) => {
        acc[student.id] = { studentId: student.id, status: null, description: '' };
        return acc;
    }, {} as Record<string, DailyRecord>);
  
  const [records, setRecords] = React.useState<Record<string, DailyRecord>>(initialRecords);

  const students = allStudents.filter((s) => s.classId === selectedClass.id);

  React.useEffect(() => {
    const newRecords: Record<string, DailyRecord> = allStudents
      .filter(s => s.classId === selectedClass.id)
      .reduce((acc, student) => {
        acc[student.id] = { studentId: student.id, status: null, description: '' };
        return acc;
      }, {} as Record<string, DailyRecord>);

    // You can apply some initial mock data here if needed, for example:
    const student1 = students[0]?.id;
    const student3 = students[2]?.id;
    if (student1) {
        newRecords[student1].status = '+';
        newRecords[student1].description = 'Derse aktif katılım gösterdi.';
    }
    if (student3) {
        newRecords[student3].status = '-';
        newRecords[student3].description = 'Ödevini evde unutmuş.';
    }
    setRecords(newRecords);
  }, [selectedClass.id, students]);

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

  const handleSave = () => {
    console.log("Kaydedilen Veriler:", { records });
    toast({
      title: "Kayıt Başarılı",
      description: `${selectedClass.name} sınıfı için ${format(recordDate, 'dd MMMM yyyy')} tarihli kayıtlar ve notlar kaydedildi.`,
    });
  };

  const handleGenerateDescription = async (studentId: string) => {
    setGeneratingFor(studentId);
    startTransition(async () => {
      try {
        const result = await generateDescriptionAction({
          studentId: studentId,
          classId: selectedClass.id,
          recordDate: format(recordDate, 'yyyy-MM-dd'),
        });
        
        if (result.description) {
          handleRecordChange(studentId, { description: result.description });
           toast({
            title: "AI Notu Oluşturuldu",
            description: "Öğrenci için otomatik not başarıyla oluşturuldu.",
          });
        } else if (result.error) {
             toast({
                title: "Hata",
                description: result.error,
                variant: "destructive",
            });
        }
      } catch (error) {
        toast({
            title: "Hata",
            description: "AI notu oluşturulurken bir hata oluştu.",
            variant: "destructive",
        });
      } finally {
        setGeneratingFor(null);
      }
    });
  };

  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className='flex-1'>
            <h1 className="text-2xl font-semibold">{selectedClass.name} - Günlük Takip</h1>
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
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <CardTitle>Değerlendirme Tablosu</CardTitle>
                <div className="flex w-full md:w-auto items-center gap-2">
                    <Button onClick={handleSave} className="h-10">
                        <FileText className="mr-2 h-4 w-4" />
                        Değişiklikleri Kaydet
                    </Button>
                </div>
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
                                <TableHead key={option.value} className="w-[100px] text-center">
                                   <div className='flex flex-col items-center gap-2'>
                                        <div className='flex items-center justify-center gap-1.5'>
                                            {option.icon && <option.icon className={cn("h-5 w-5", option.color)} />}
                                            <span>{option.label}</span>
                                        </div>
                                        <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => handleAllStatusChange(option.value)}>
                                            Tümü
                                        </Button>
                                   </div>
                                </TableHead>
                            ))}
                            <TableHead className="min-w-[250px]">Açıklama</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map(student => {
                            const record = records[student.id];
                            const rowColorClass = record?.status ? 'bg-opacity-50' : 'hover:bg-muted/50';

                             const statusColorMapping: { [key in AttendanceStatus]?: string } = {
                                '+': 'bg-green-100 dark:bg-green-900/40',
                                '½': 'bg-green-50 dark:bg-green-900/20',
                                '-': 'bg-red-100 dark:bg-red-900/40',
                                'Y': 'bg-yellow-100 dark:bg-yellow-900/40',
                                'G': 'bg-blue-100 dark:bg-blue-900/40',
                            };

                            const appliedColor = statusColorMapping[record?.status!] || '';

                            return (
                                <TableRow key={student.id} className={cn("transition-colors", rowColorClass, appliedColor)}>
                                    <TableCell className="text-center text-muted-foreground font-medium">{student.studentNumber}</TableCell>
                                    <TableCell className="font-medium">{student.firstName} {student.lastName}</TableCell>
                                    
                                     <RadioGroup
                                        value={record?.status || ''}
                                        onValueChange={(value) => handleRecordChange(student.id, { status: value as AttendanceStatus })}
                                        className="contents"
                                    >
                                        {statusOptions.map(option => (
                                            <TableCell key={option.value} className="text-center">
                                                 <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <RadioGroupItem value={option.value} id={`${student.id}-${option.value}`} aria-label={option.label} />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{option.label}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                        ))}
                                    </RadioGroup>
                                    <TableCell className='min-w-[250px]'>
                                        <div className='flex items-center gap-2'>
                                            <Textarea 
                                                value={record?.description || ''}
                                                onChange={(e) => handleRecordChange(student.id, { description: e.target.value })}
                                                placeholder='Öğrenci hakkında notunuzu girin...'
                                                className='min-h-[40px] flex-1 text-sm bg-white dark:bg-card'
                                                rows={1}
                                            />
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button 
                                                        size='icon'
                                                        variant='ghost'
                                                        onClick={() => handleGenerateDescription(student.id)}
                                                        disabled={isPending && generatingFor === student.id}
                                                    >
                                                        {isPending && generatingFor === student.id ? (
                                                            <Loader2 className="h-5 w-5 animate-spin" />
                                                        ) : (
                                                            <Sparkles className="h-5 w-5 text-primary" />
                                                        )}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>AI ile Not Oluştur</p>
                                                </TooltipContent>
                                            </Tooltip>
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
