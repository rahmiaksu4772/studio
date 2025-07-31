
'use client';

import * as React from 'react';
import { useTransition } from 'react';
import {
  FileText,
  Calendar as CalendarIcon,
  Sparkles,
  Loader2,
  Book,
  PlusCircle,
  Trash2
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
import { classes, students as allStudents, dailyRecords } from '@/lib/mock-data';
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

export default function GunlukTakipPage() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = React.useState<ClassInfo>(classes[0]);
  const [recordDate, setRecordDate] = React.useState<Date | null>(null);
  const [generalDescription, setGeneralDescription] = React.useState('');
  const [isPending, startTransition] = useTransition();
  const [generatingFor, setGeneratingFor] = React.useState<string | null>(null);
  const [records, setRecords] = React.useState<DailyRecord[]>([]);

  React.useEffect(() => {
    setRecordDate(new Date());
  }, []);
  
  React.useEffect(() => {
    if (recordDate) {
      const dateStr = format(recordDate, 'yyyy-MM-dd');
      const filteredRecords = dailyRecords.filter(r => r.classId === selectedClass.id && r.date === dateStr);
      setRecords(filteredRecords);
      setGeneralDescription('');
    }
  }, [selectedClass.id, recordDate]);

  const students = allStudents.filter((s) => s.classId === selectedClass.id);

  const handleAddRecord = (studentId: string, status: AttendanceStatus, description: string) => {
    if (!recordDate) return;
    const newRecord: DailyRecord = {
      id: `record-${studentId}-${Date.now()}`,
      studentId,
      classId: selectedClass.id,
      date: format(recordDate, 'yyyy-MM-dd'),
      status,
      description,
    };
    setRecords(prev => [...prev, newRecord]);
  };

  const handleUpdateRecord = (recordId: string, newRecord: Partial<Omit<DailyRecord, 'id'>>) => {
    setRecords((prev) => 
        prev.map(r => r.id === recordId ? {...r, ...newRecord} : r)
    );
  }

  const handleDeleteRecord = (recordId: string) => {
    setRecords(prev => prev.filter(r => r.id !== recordId));
     toast({
      title: "Not Silindi",
      description: "Öğrenci notu başarıyla kaldırıldı.",
      variant: 'destructive',
    });
  };

  const handleBulkStatusUpdate = (status: AttendanceStatus) => {
    if (!recordDate) return;
    const newRecordsForStudents = students
        .map(student => {
            const newRecord: DailyRecord = {
                id: `record-${student.id}-${Date.now()}`,
                studentId: student.id,
                classId: selectedClass.id,
                date: format(recordDate, 'yyyy-MM-dd'),
                status,
                description: `Toplu olarak "${statusOptions.find(s=>s.value === status)?.label}" eklendi.`,
            };
            return newRecord;
        });

    // We can decide to either replace or add. Let's add.
    setRecords(prev => [...prev, ...newRecordsForStudents]);

    toast({
      title: "Toplu Ekleme Başarılı",
      description: `${selectedClass.name} sınıfındaki her öğrenci için "${statusOptions.find(s=>s.value === status)?.label}" durumu eklendi.`,
    });
  };

  const handleSave = () => {
    if (!recordDate) return;
    // In a real app, you would save this to a database
    // Here we just log it and update the mock data for the session
    console.log("Kaydedilen Veriler:", { 
        date: format(recordDate, 'yyyy-MM-dd'), 
        classId: selectedClass.id, 
        records: records,
        generalDescription: generalDescription,
     });
    toast({
      title: "Kayıt Başarılı",
      description: `${selectedClass.name} sınıfı için ${format(recordDate, 'dd MMMM yyyy')} tarihli kayıtlar, notlar ve genel açıklama kaydedildi. (Konsolu kontrol edin)`,
    });
  };

  const handleGenerateDescription = async (studentId: string, onDescription: (desc: string) => void) => {
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
          onDescription(result.description);
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
    });
  };
  
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
                                        <p>Tüm öğrenciler için "{option.label}" notu ekle</p>
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
                                <TableHead>Gözlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map(student => {
                                const studentRecords = records.filter(r => r.studentId === student.id);
                                return (
                                    <StudentRow 
                                        key={student.id} 
                                        student={student}
                                        records={studentRecords}
                                        onUpdateRecord={handleUpdateRecord}
                                        onDeleteRecord={handleDeleteRecord}
                                        onAddRecord={handleAddRecord}
                                        onGenerateDescription={handleGenerateDescription}
                                        isPending={isPending && generatingFor === student.id}
                                    />
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

// Sub-component for each student row to manage its own state for adding new notes
function StudentRow({ student, records, onUpdateRecord, onDeleteRecord, onAddRecord, onGenerateDescription, isPending }: {
    student: Student,
    records: DailyRecord[],
    onUpdateRecord: (recordId: string, newRecord: Partial<DailyRecord>) => void,
    onDeleteRecord: (recordId: string) => void,
    onAddRecord: (studentId: string, status: AttendanceStatus, description: string) => void,
    onGenerateDescription: (studentId: string, onDescription: (desc: string) => void) => void,
    isPending: boolean,
}) {
    const [newStatus, setNewStatus] = React.useState<AttendanceStatus>('+');
    const [newDescription, setNewDescription] = React.useState('');

    const handleAdd = () => {
        if (!newStatus) return;
        onAddRecord(student.id, newStatus, newDescription);
        // Reset form
        setNewStatus('+');
        setNewDescription('');
    }

    return (
         <TableRow key={student.id}>
            <TableCell className="font-medium text-center align-top pt-6">{student.studentNumber}</TableCell>
            <TableCell className='font-semibold align-top pt-6'>{student.firstName} {student.lastName}</TableCell>
            <TableCell>
                <div className='flex flex-col gap-3'>
                    {records.map(record => (
                        <div key={record.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                            <RadioGroup 
                                value={record.status || ""} 
                                onValueChange={(status) => onUpdateRecord(record.id, { status: status as AttendanceStatus })}
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
                            <Textarea 
                                value={record.description || ''}
                                onChange={(e) => onUpdateRecord(record.id, { description: e.target.value })}
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
                                            className='h-9 w-9 flex-shrink-0'
                                            onClick={() => onDeleteRecord(record.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Notu Sil</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    ))}

                    {/* Form for adding a new record */}
                    <div className="flex items-start gap-2 p-2 rounded-md border border-dashed">
                       <RadioGroup 
                            value={newStatus} 
                            onValueChange={(status) => setNewStatus(status as AttendanceStatus)}
                            className="flex items-center gap-1"
                        >
                            {statusOptions.map(option => (
                                <TooltipProvider key={`new-${student.id}-${option.value}`}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Label 
                                                htmlFor={`new-${student.id}-${option.value}`}
                                                className={cn(
                                                    "flex items-center justify-center h-9 w-9 rounded-md border text-muted-foreground cursor-pointer transition-colors hover:border-primary",
                                                     "data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary",
                                                    newStatus === option.value && "border-primary bg-primary/10 text-primary"
                                                )}
                                            >
                                                {option.icon && <option.icon className="h-5 w-5" />}
                                                <RadioGroupItem value={option.value} id={`new-${student.id}-${option.value}`} className='sr-only'/>
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
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            placeholder='Yeni not ekle...'
                            className='min-h-[40px] text-sm flex-1'
                            rows={1}
                        />
                         <div className='flex flex-col gap-1'>
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            size='icon'
                                            variant='ghost'
                                            className='h-9 w-9'
                                            onClick={() => onGenerateDescription(student.id, setNewDescription)}
                                            disabled={isPending}
                                        >
                                            {isPending ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Sparkles className="h-5 w-5 text-primary" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>AI ile Doldur</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            size='icon'
                                            variant='ghost'
                                            className='h-9 w-9'
                                            onClick={handleAdd}
                                            disabled={isPending}
                                        >
                                            <PlusCircle className="h-5 w-5 text-green-600" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Not Ekle</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </TableCell>
        </TableRow>
    )
}
