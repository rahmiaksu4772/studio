
'use client';

import * as React from 'react';
import { useTransition } from 'react';
import {
  FileText,
  Calendar as CalendarIcon,
  Sparkles,
  Loader2,
  Book,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';

export default function GunlukTakipPage() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = React.useState<ClassInfo>(classes[0]);
  const [recordDate, setRecordDate] = React.useState<Date | null>(null);
  const [generalDescription, setGeneralDescription] = React.useState('');
  const [isPending, startTransition] = useTransition();
  const [generatingFor, setGeneratingFor] = React.useState<string | null>(null);
  
  const getInitialRecords = (classId: string, date: Date): Record<string, DailyRecord> => {
      if (!date) return {};
    return allStudents
      .filter(s => s.classId === classId)
      .reduce((acc, student) => {
        acc[student.id] = { 
            id: `record-${student.id}-${date.toISOString()}`,
            studentId: student.id, 
            status: null, 
            description: '', 
            date: format(date, 'yyyy-MM-dd'), 
            classId: classId 
        };
        return acc;
      }, {} as Record<string, DailyRecord>);
  };

  const [records, setRecords] = React.useState<Record<string, DailyRecord>>({});
  
  React.useEffect(() => {
    setRecordDate(new Date());
  }, []);
  
  React.useEffect(() => {
    if (recordDate) {
      setRecords(getInitialRecords(selectedClass.id, recordDate));
      setGeneralDescription('');
    }
  }, [selectedClass.id, recordDate]);

  const students = allStudents.filter((s) => s.classId === selectedClass.id);

  const handleRecordChange = (studentId: string, newRecord: Partial<Omit<DailyRecord, 'id' | 'studentId'>>) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], ...newRecord },
    }));
  };

  const handleBulkStatusUpdate = (status: AttendanceStatus) => {
    setRecords(prevRecords => {
      const newRecords = { ...prevRecords };
      students.forEach(student => {
        if(newRecords[student.id]){
             newRecords[student.id] = {
                ...newRecords[student.id],
                status: status,
            };
        }
      });
      return newRecords;
    });
    toast({
      title: "Toplu Güncelleme Başarılı",
      description: `${selectedClass.name} sınıfındaki tüm öğrencilerin durumu "${statusOptions.find(s=>s.value === status)?.label}" olarak ayarlandı.`,
    });
  };

  const handleSave = () => {
    if (!recordDate) return;
    console.log("Kaydedilen Veriler:", { 
        date: format(recordDate, 'yyyy-MM-dd'), 
        classId: selectedClass.id, 
        records: Object.values(records).filter(r => r.status || r.description),
        generalDescription: generalDescription,
     });
    toast({
      title: "Kayıt Başarılı",
      description: `${selectedClass.name} sınıfı için ${format(recordDate, 'dd MMMM yyyy')} tarihli kayıtlar, notlar ve genel açıklama kaydedildi. (Konsolu kontrol edin)`,
    });
  };

  const handleGenerateDescription = async (studentId: string) => {
    if(!recordDate) return;

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

  const currentRecord = (studentId: string) => records[studentId];
  
  if (!recordDate) {
    return (
      <AppLayout>
        <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className='flex-1'>
            <h1 className="text-2xl font-bold tracking-tight">{selectedClass.name} - Günlük Takip</h1>
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
                <CardTitle>Genel Değerlendirme</CardTitle>
                <CardDescription>
                    Dersin veya günün geneli hakkında notlarınızı ve toplu işlemleri buradan yapabilirsiniz.
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className='space-y-2'>
                        <Label htmlFor="general-description" className='flex items-center gap-2 font-semibold'>
                            <Book className="h-4 w-4" />
                            Genel Açıklama
                        </Label>
                        <Textarea 
                            id="general-description"
                            placeholder='Örn: Bugün matematik dersinde kesirler konusunu işledik. Sınıfın genel katılımı iyiydi.'
                            value={generalDescription}
                            onChange={(e) => setGeneralDescription(e.target.value)}
                            className='min-h-[60px]'
                        />
                    </div>
                    <Button onClick={handleSave} className="h-10 w-full md:w-auto self-end">
                        <FileText className="mr-2 h-4 w-4" />
                        Tüm Değişiklikleri Kaydet
                    </Button>
                </div>
                 <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-semibold">
                        Tüm Sınıfa Uygula
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map(option => (
                           <TooltipProvider key={option.value}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleBulkStatusUpdate(option.value)}
                                            className={cn("h-9 w-auto px-3 gap-2", option.color)}
                                        >
                                           {option.icon && <option.icon className="h-4 w-4" />}
                                           <span className='hidden sm:inline'>{option.label}</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Tümünü "{option.label}" olarak işaretle</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Öğrenci Değerlendirmeleri</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[80px] text-center">No</TableHead>
                                <TableHead>Adı Soyadı</TableHead>
                                <TableHead className="w-[280px]">Durum</TableHead>
                                <TableHead>Açıklama</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map(student => {
                                const record = currentRecord(student.id);
                                if (!record) return null;
                                return (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium text-center">{student.studentNumber}</TableCell>
                                        <TableCell className='font-semibold'>{student.firstName} {student.lastName}</TableCell>
                                        <TableCell>
                                            <RadioGroup 
                                                value={record.status || ""} 
                                                onValueChange={(status) => handleRecordChange(student.id, { status: status as AttendanceStatus })}
                                                className="flex items-center gap-1"
                                            >
                                                {statusOptions.map(option => (
                                                    <TooltipProvider key={`${record.id}-${option.value}`}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Label 
                                                                    htmlFor={`${record.id}-${option.value}`}
                                                                    className={cn(
                                                                        "flex items-center justify-center h-9 w-9 rounded-md border text-muted-foreground cursor-pointer transition-colors hover:border-primary",
                                                                        "data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary",
                                                                        record.status === option.value && "border-primary bg-primary/10 text-primary"
                                                                    )}
                                                                >
                                                                    {option.icon && <option.icon className="h-5 w-5" />}
                                                                    <RadioGroupItem value={option.value} id={`${record.id}-${option.value}`} className='sr-only'/>
                                                                </Label>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{option.label}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ))}
                                            </RadioGroup>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Textarea 
                                                    value={record.description || ''}
                                                    onChange={(e) => handleRecordChange(student.id, { description: e.target.value })}
                                                    placeholder='Öğrenci hakkında not...'
                                                    className='min-h-[40px] text-sm flex-1'
                                                    rows={1}
                                                />
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button 
                                                                size='icon'
                                                                variant='ghost'
                                                                className='h-9 w-9'
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
                                                </TooltipProvider>
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
