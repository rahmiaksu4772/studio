
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
import { getClasses, getStudents, getDailyRecords, saveDailyRecords } from '@/services/firestore';

type StudentRecordsState = {
  [studentId: string]: Partial<Omit<DailyRecord, 'id' | 'classId' | 'studentId' | 'date' >>;
};

export default function GunlukTakipPage() {
  const { toast } = useToast();
  const [classes, setClasses] = React.useState<ClassInfo[]>([]);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = React.useState<ClassInfo | null>(null);
  const [recordDate, setRecordDate] = React.useState<Date | null>(new Date());
  const [generalDescription, setGeneralDescription] = React.useState('');
  const [generatingFor, setGeneratingFor] = React.useState<string | null>(null);
  const [studentRecords, setStudentRecords] = React.useState<StudentRecordsState>({});
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Fetch classes on mount
  React.useEffect(() => {
    async function fetchClasses() {
      const fetchedClasses = await getClasses();
      setClasses(fetchedClasses);
      if (fetchedClasses.length > 0) {
        setSelectedClass(fetchedClasses[0]);
      } else {
        setIsLoading(false);
      }
    }
    fetchClasses();
  }, []);

  // Fetch students and records when class or date changes
  React.useEffect(() => {
    async function fetchData() {
      if (!selectedClass || !recordDate) return;
      
      setIsLoading(true);
      const dateStr = format(recordDate, 'yyyy-MM-dd');
      
      const [fetchedStudents, fetchedRecords] = await Promise.all([
        getStudents(selectedClass.id),
        getDailyRecords(selectedClass.id, dateStr)
      ]);

      setStudents(fetchedStudents.sort((a, b) => a.studentNumber - b.studentNumber));

      const recordsByStudent = fetchedRecords.reduce((acc, record) => {
        acc[record.studentId] = { status: record.status, description: record.description };
        return acc;
      }, {} as StudentRecordsState);
      
      setStudentRecords(recordsByStudent);
      setIsLoading(false);
    }
    fetchData();
  }, [selectedClass, recordDate]);

  
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
        ...studentRecords[student.id], // Preserve existing description
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
        await saveDailyRecords(recordsToUpdate);
        toast({
          title: "Kayıt Başarılı",
          description: `${selectedClass.name} sınıfı için ${format(recordDate, 'dd MMMM yyyy')} tarihli kayıtlar başarıyla kaydedildi.`,
        });
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
  
  if (!recordDate || isLoading) {
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
            <h1 className="text-2xl font-bold tracking-tight">{selectedClass?.name || "Sınıf Yükleniyor..."} - Günlük Takip</h1>
            <p className="text-muted-foreground">{format(recordDate, 'dd MMMM yyyy, cccc', { locale: tr })}</p>
          </div>
          <div className="flex items-center gap-4">
            <Select
              value={selectedClass?.id}
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full md:w-[280px] justify-start text-left font-normal",
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
                           <Button 
                                key={option.value}
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkStatusUpdate(option.value)}
                                className={cn(
                                  "h-9 w-auto px-3 gap-2",
                                  "hover:bg-opacity-20",
                                  option.color,
                                  option.bgColor,
                                )}
                            >
                               {option.icon && <option.icon className="h-4 w-4" />}
                               <span>{option.label}</span>
                            </Button>
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
                                <TableHead className="w-[60px] text-center">No</TableHead>
                                <TableHead>Adı Soyadı</TableHead>
                                <TableHead className="min-w-[320px]">Durum</TableHead>
                                <TableHead>Açıklama</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map(student => {
                                const record = studentRecords[student.id] || { status: null, description: '' };
                                const isGenerating = generatingFor === student.id;

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
                                                    <Label 
                                                        key={`${student.id}-${option.value}`}
                                                        htmlFor={`${student.id}-${option.value}`}
                                                        className={cn(
                                                          "flex items-center gap-1.5 cursor-pointer rounded-md border p-1 px-2 transition-colors text-xs",
                                                          "hover:bg-opacity-20",
                                                          record.status === option.value
                                                            ? cn("font-semibold", option.color, option.bgColor, "border-current")
                                                            : "text-muted-foreground hover:border-primary"
                                                        )}
                                                    >
                                                        {option.icon && <option.icon className="h-4 w-4" />}
                                                        <span>{option.label}</span>
                                                        <RadioGroupItem value={option.value} id={`${student.id}-${option.value}`} className='sr-only'/>
                                                    </Label>
                                                ))}
                                            </RadioGroup>
                                        </TableCell>
                                        <TableCell>
                                            <div className="relative">
                                                <Textarea 
                                                    value={record.description || ''}
                                                    onChange={(e) => handleRecordChange(student.id, { description: e.target.value })}
                                                    placeholder='Öğrenci hakkında not...'
                                                    className='min-h-[40px] text-sm pr-9'
                                                    rows={1}
                                                />
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button 
                                                                size='icon'
                                                                variant='ghost'
                                                                onClick={() => handleGenerateDescription(student.id)}
                                                                disabled={isGenerating}
                                                                className='absolute top-1/2 right-0.5 -translate-y-1/2 h-7 w-7'
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
                </div>
            </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
