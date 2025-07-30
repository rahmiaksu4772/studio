
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
  const [recordDate, setRecordDate] = React.useState<Date>(new Date());
  const [generalDescription, setGeneralDescription] = React.useState('');
  const [isPending, startTransition] = useTransition();
  const [generatingFor, setGeneratingFor] = React.useState<string | null>(null);

  const students = allStudents.filter((s) => s.classId === selectedClass.id);

  const getInitialRecords = (classId: string, date: Date): Record<string, DailyRecord> => {
    return allStudents
    .filter(s => s.classId === classId)
    .reduce((acc, student) => {
        acc[student.id] = { studentId: student.id, status: null, description: '', date: format(date, 'yyyy-MM-dd'), classId: classId };
        return acc;
    }, {} as Record<string, DailyRecord>);
  }

  const [records, setRecords] = React.useState<Record<string, DailyRecord>>(getInitialRecords(selectedClass.id, recordDate));

  React.useEffect(() => {
    setRecords(getInitialRecords(selectedClass.id, recordDate));
    setGeneralDescription('');
  }, [selectedClass.id, recordDate]);

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

  const handleSave = () => {
    console.log("Kaydedilen Veriler:", { 
        date: format(recordDate, 'yyyy-MM-dd'), 
        classId: selectedClass.id, 
        records: Object.values(records),
        generalDescription: generalDescription,
     });
    toast({
      title: "Kayıt Başarılı",
      description: `${selectedClass.name} sınıfı için ${format(recordDate, 'dd MMMM yyyy')} tarihli kayıtlar, notlar ve genel açıklama kaydedildi. (Konsolu kontrol edin)`,
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
                <CardTitle>Genel Değerlendirme</CardTitle>
                <CardDescription>
                    Dersin veya günün geneli hakkında notlarınızı buraya ekleyebilirsiniz.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className='space-y-2'>
                        <Label htmlFor="general-description" className='flex items-center gap-2'>
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
            </CardContent>
        </Card>

        <div className='space-y-4'>
            <h2 className='text-xl font-semibold'>Öğrenci Değerlendirmeleri</h2>
            <div className="relative">
                <div className="flex w-full gap-4 pb-4 overflow-x-auto">
                {students.map(student => {
                    const record = records[student.id];
                    return (
                        <Card key={student.id} className="min-w-[320px] flex-shrink-0">
                            <CardHeader>
                                <div className='flex items-start justify-between'>
                                    <div>
                                        <CardTitle className='text-base'>{student.firstName} {student.lastName}</CardTitle>
                                        <CardDescription>No: {student.studentNumber}</CardDescription>
                                    </div>
                                    <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button 
                                                size='icon'
                                                variant='ghost'
                                                className='-mr-2 -mt-2'
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
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <RadioGroup 
                                    value={record?.status || ""} 
                                    onValueChange={(status) => handleRecordChange(student.id, { status: status as AttendanceStatus })}
                                    className='grid grid-cols-5 gap-2'
                                >
                                    {statusOptions.map(option => (
                                        <TooltipProvider key={option.value}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Label 
                                                        htmlFor={`${student.id}-${option.value}`}
                                                        className={cn(
                                                            "flex flex-col items-center justify-center gap-1.5 rounded-md p-2 border-2 text-muted-foreground cursor-pointer transition-colors hover:border-primary",
                                                            record?.status === option.value && "border-primary bg-primary/10 text-primary"
                                                            )}
                                                        >
                                                            {option.icon && <option.icon className="h-5 w-5" />}
                                                            <span className='text-xs font-semibold'>{option.label}</span>
                                                            <RadioGroupItem value={option.value} id={`${student.id}-${option.value}`} className='sr-only'/>
                                                        </Label>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{option.label}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ))}
                                </RadioGroup>
                                <Textarea 
                                    value={record?.description || ''}
                                    onChange={(e) => handleRecordChange(student.id, { description: e.target.value })}
                                    placeholder='Öğrenci hakkında not...'
                                    className='min-h-[40px] text-sm bg-white dark:bg-card'
                                    rows={2}
                                />
                            </CardContent>
                        </Card>
                    )
                })}
                </div>
            </div>
        </div>
      </main>
    </AppLayout>
  );

    