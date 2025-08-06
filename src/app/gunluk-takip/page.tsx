
'use client';

import * as React from 'react';
import {
  FileText,
  Calendar as CalendarIcon,
  Sparkles,
  Loader2,
  Book
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
import type { Student, DailyRecord, AttendanceStatus, ClassInfo } from '@/lib/types';
import { statusOptions } from '@/lib/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { generateDescriptionAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useDailyRecords, useClassesAndStudents } from '@/hooks/use-daily-records';


type StudentRecordsState = {
  [studentId: string]: Partial<Omit<DailyRecord, 'id' | 'classId' | 'studentId' | 'date' >>;
};

export default function GunlukTakipPage() {
  const { toast } = useToast();
  const { classes, isLoading: isClassesLoading } = useClassesAndStudents();
  const { getRecordsForDate, updateDailyRecords, isLoading: isRecordsLoading } = useDailyRecords();
  
  const [students, setStudents] = React.useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = React.useState<ClassInfo | null>(null);
  const [recordDate, setRecordDate] = React.useState<Date | null>(new Date());
  const [generalDescription, setGeneralDescription] = React.useState('');
  const [generatingFor, setGeneratingFor] = React.useState<string | null>(null);
  const [studentRecords, setStudentRecords] = React.useState<StudentRecordsState>({});
  
  // Set initial class
  React.useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0]);
    }
  }, [classes, selectedClass]);
  
  // Fetch students and records when class or date changes
  React.useEffect(() => {
    if (!selectedClass || !recordDate) return;
    
    const currentClass = classes.find(c => c.id === selectedClass.id);
    const sortedStudents = currentClass?.students.sort((a, b) => a.studentNumber - b.studentNumber) || [];
    setStudents(sortedStudents);

    const dateStr = format(recordDate, 'yyyy-MM-dd');
    const existingRecords = getRecordsForDate(selectedClass.id, dateStr);
    
    const recordsByStudent = existingRecords.reduce((acc, record) => {
      acc[record.studentId] = { status: record.status, description: record.description };
      return acc;
    }, {} as StudentRecordsState);
      
    setStudentRecords(recordsByStudent);
  }, [selectedClass, recordDate, classes, getRecordsForDate]);

  
  const handleRecordChange = (studentId: string, newRecord: Partial<Omit<DailyRecord, 'id' | 'classId' | 'studentId' | 'date'>>) => {
    setStudentRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        ...newRecord
      }
    }));
  };

  const handleBulkStatusUpdate = (status: AttendanceStatus) => {
    const newRecords: StudentRecordsState = {};
    students.forEach(student => {
      newRecords[student.id] = {
        ...studentRecords[student.id],
        status,
      };
    });
    setStudentRecords(newRecords);
     toast({
      title: "Toplu Güncelleme Uygulandı",
      description: `${selectedClass?.name} sınıfındaki tüm öğrenciler için "${statusOptions.find(s=>s.value === status)?.label}" durumu ayarlandı. Değişiklikleri kaydetmeyi unutmayın.`,
    });
  };

  const handleSave = async () => {
    if (!recordDate || !selectedClass) return;

    const dateStr = format(recordDate, 'yyyy-MM-dd');
    const recordsToUpdate: Omit<DailyRecord, 'id'>[] = Object.entries(studentRecords)
        .filter(([_, record]) => record.status || record.description)
        .map(([studentId, record]) => ({
            studentId,
            classId: selectedClass.id,
            date: dateStr,
            status: record.status || null,
            description: record.description || '',
        }));

    if (recordsToUpdate.length === 0) {
        toast({
            title: "Kaydedilecek Değişiklik Yok",
            description: "Lütfen en az bir öğrenci için veri girin.",
            variant: "destructive"
        });
        return;
    }

    try {
        updateDailyRecords(selectedClass.id, dateStr, recordsToUpdate);
        toast({
          title: "Kayıt Başarılı",
          description: `${selectedClass.name} sınıfı için ${format(recordDate, 'dd MMMM yyyy')} tarihli kayıtlar başarıyla kaydedildi.`,
        });
        // Reset form for new entry
        setStudentRecords({});
        setGeneralDescription('');
    } catch (error) {
        console.error("Error saving records:", error);
        toast({
            title: "Kayıt Hatası",
            description: "Kayıtlar kaydedilirken bir hata oluştu.",
            variant: "destructive"
        });
    }
  };

  const handleGenerateDescription = async (studentId: string) => {
    if(!recordDate || !selectedClass) return;

    setGeneratingFor(studentId);
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
          description: "Otomatik not başarıyla oluşturuldu.",
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
  };
  
  const isLoading = isClassesLoading || isRecordsLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">{selectedClass?.name || "Sınıf Yükleniyor..."} - Günlük Takip</h2>
            <div className="flex items-center space-x-2">
            <Select
              value={selectedClass?.id}
              onValueChange={(classId) => {
                const newClass = classes.find(c => c.id === classId);
                if (newClass) setSelectedClass(newClass);
              }}
            >
              <SelectTrigger className="w-[180px]">
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !recordDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {recordDate ? format(recordDate, 'dd MMMM yyyy - EEEE', { locale: tr}) : <span>Tarih Seç</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={recordDate || undefined}
                  onSelect={(date) => setRecordDate(date || null)}
                  initialFocus
                  locale={tr}
                />
              </PopoverContent>
            </Popover>
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
                 <div className="grid grid-cols-2 gap-4 items-end">
                    <div className='space-y-1'>
                        <Label htmlFor="general-description">Genel Açıklama</Label>
                        <Textarea 
                            id="general-description"
                            placeholder='Örn: Bugün matematik dersinde kesirler konusunu işledik. Sınıfın genel katılımı iyiydi.'
                            value={generalDescription}
                            onChange={(e) => setGeneralDescription(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleSave} className="h-10">
                        <FileText className="mr-2 h-4 w-4" />
                        Tüm Değişiklikleri Kaydet
                    </Button>
                </div>
                 <div className="space-y-2">
                    <Label>Tüm Sınıfa Uygula</Label>
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map(option => (
                           <Button 
                                key={option.value}
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkStatusUpdate(option.value)}
                            >
                               {option.icon && <option.icon className="mr-2 h-4 w-4" />}
                               <span>{option.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Öğrenci Değerlendirmeleri</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Okul No</TableHead>
                            <TableHead>Adı Soyadı</TableHead>
                            <TableHead className="w-[300px]">Durum</TableHead>
                            <TableHead>Açıklama</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map(student => {
                            const record = studentRecords[student.id] || { status: null, description: '' };
                            const isGenerating = generatingFor === student.id;

                            return (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.studentNumber}</TableCell>
                                    <TableCell>{student.firstName} {student.lastName}</TableCell>
                                    <TableCell>
                                        <RadioGroup 
                                            value={record.status || ""} 
                                            onValueChange={(status) => handleRecordChange(student.id, { status: status as AttendanceStatus })}
                                            className="flex space-x-2"
                                        >
                                            {statusOptions.map(option => (
                                                <div key={`${student.id}-${option.value}`} className="flex items-center space-x-1">
                                                    <RadioGroupItem value={option.value} id={`${student.id}-${option.value}`} />
                                                    <Label htmlFor={`${student.id}-${option.value}`}>{option.label}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </TableCell>
                                    <TableCell>
                                        <div className="relative">
                                            <Textarea 
                                                value={record.description || ''}
                                                onChange={(e) => handleRecordChange(student.id, { description: e.target.value })}
                                                placeholder='Öğrenci hakkında not...'
                                                className='min-h-[40px] pr-10'
                                            />
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button 
                                                            size='icon'
                                                            variant='ghost'
                                                            onClick={() => handleGenerateDescription(student.id)}
                                                            disabled={isGenerating}
                                                            className='absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8'
                                                        >
                                                            {isGenerating ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Sparkles className="h-4 w-4 text-primary" />
                                                            )}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>AI ile Doldur</p>
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
            </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
