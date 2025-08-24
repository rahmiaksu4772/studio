
'use client';

import * as React from 'react';
import {
  FileText,
  Calendar as CalendarIcon,
  Loader2,
  Save,
  MessageSquarePlus,
  ArrowLeft,
  Users
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
import { Textarea } from '@/components/ui/textarea';
import type { Student, DailyRecord, AttendanceStatus, ClassInfo } from '@/lib/types';
import { statusOptions } from '@/lib/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useDailyRecords, useClassesAndStudents } from '@/hooks/use-daily-records';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
  } from '@/components/ui/dialog';

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
  const [studentRecords, setStudentRecords] = React.useState<StudentRecordsState>({});
  const [initialRecordsState, setInitialRecordsState] = React.useState<StudentRecordsState>({});

  const [editingNoteFor, setEditingNoteFor] = React.useState<Student | null>(null);
  const [currentNote, setCurrentNote] = React.useState('');

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
    setInitialRecordsState(JSON.parse(JSON.stringify(recordsByStudent))); // Deep copy for comparison
  }, [selectedClass, recordDate, classes, getRecordsForDate]);

  const hasChanges = React.useMemo(() => {
    return JSON.stringify(studentRecords) !== JSON.stringify(initialRecordsState);
  }, [studentRecords, initialRecordsState]);

  
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentRecords(prev => {
        const currentStatus = prev[studentId]?.status;
        return {
            ...prev,
            [studentId]: {
                ...prev[studentId],
                // If the same status is clicked again, unselect it. Otherwise, set the new status.
                status: currentStatus === status ? null : status
            }
        };
    });
  };

  const openNoteEditor = (student: Student) => {
    setEditingNoteFor(student);
    setCurrentNote(studentRecords[student.id]?.description || '');
  }

  const handleSaveNote = () => {
    if (!editingNoteFor) return;
    setStudentRecords(prev => ({
        ...prev,
        [editingNoteFor.id]: {
            ...prev[editingNoteFor.id],
            description: currentNote
        }
    }));
    setEditingNoteFor(null);
    setCurrentNote('');
    toast({
        title: "Not Kaydedildi",
        description: `${editingNoteFor.firstName} için not taslak olarak kaydedildi. Ana kaydetme butonuna basmayı unutmayın.`
    })
  }

  const handleSaveAll = async () => {
    if (!recordDate || !selectedClass) return;

    const dateStr = format(recordDate, 'yyyy-MM-dd');
    const recordsToUpdate: Omit<DailyRecord, 'id'>[] = Object.entries(studentRecords)
        .map(([studentId, record]) => ({
            studentId,
            classId: selectedClass.id,
            date: dateStr,
            status: record.status || null,
            description: record.description || '',
        }));

    try {
        updateDailyRecords(selectedClass.id, dateStr, recordsToUpdate);
        setInitialRecordsState(JSON.parse(JSON.stringify(studentRecords))); // Update initial state
        toast({
          title: "Kayıt Başarılı",
          description: `${selectedClass.name} sınıfı için ${format(recordDate, 'dd MMMM yyyy')} tarihli kayıtlar başarıyla kaydedildi.`,
        });
    } catch (error) {
        console.error("Error saving records:", error);
        toast({
            title: "Kayıt Hatası",
            description: "Kayıtlar kaydedilirken bir hata oluştu.",
            variant: "destructive"
        });
    }
  };
  
  const isLoading = isClassesLoading || isRecordsLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className='flex items-center gap-2 text-xl md:text-2xl font-bold tracking-tight text-gray-700'>
                <Users className="h-7 w-7 text-primary" />
                {selectedClass?.name || "Sınıf Yükleniyor..."} - Artı/Eksi Çizelgesi
            </div>

            <div className="flex w-full md:w-auto items-center justify-between md:justify-start space-x-2">
                <Select
                  value={selectedClass?.id}
                  onValueChange={(classId) => {
                    const newClass = classes.find(c => c.id === classId);
                    if (newClass) setSelectedClass(newClass);
                  }}
                >
                  <SelectTrigger className="w-[120px] md:w-[180px]">
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
                        "w-auto justify-start text-left font-normal"
                      )}
                      size="sm"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {recordDate ? format(recordDate, 'dd MMM yyyy', { locale: tr}) : <span>Tarih</span>}
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

        <div className='flex justify-end'>
             <Button onClick={handleSaveAll} disabled={!hasChanges}>
                <Save className="mr-2 h-4 w-4" />
                Değişiklikleri Kaydet
                {hasChanges && <span className="relative flex h-3 w-3 ml-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>}
            </Button>
        </div>
        
        <Card>
            <CardContent className="p-2 md:p-4">
                <div className="space-y-1">
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-2 py-2 text-sm font-medium text-muted-foreground border-b">
                       <div>No</div>
                       <div>Adı Soyadı</div>
                       <div className='text-center'>Durum</div>
                    </div>
                    {students.map(student => {
                        const record = studentRecords[student.id] || { status: null, description: '' };
                        return (
                            <div key={student.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-2 py-3 border-b last:border-none hover:bg-muted/50 rounded-md">
                                <div className="font-medium text-muted-foreground w-8 text-center">{student.studentNumber}</div>
                                <div className='font-semibold'>{student.firstName} {student.lastName}</div>
                                <div className="flex items-center justify-end gap-1 md:gap-2">
                                     {statusOptions.map(option => (
                                         <Button
                                            key={option.value}
                                            variant={record.status === option.value ? 'default' : 'outline'}
                                            size='icon'
                                            className={cn(
                                                'rounded-full w-9 h-9 md:w-10 md:h-10 transition-all',
                                                record.status === option.value && `bg-[var(--bg-color)] text-[var(--text-color)] hover:bg-[var(--bg-color)]/90 border-2 border-primary/50`,
                                                record.status !== option.value && record.status !== null && 'opacity-50'
                                            )}
                                            style={{
                                                '--bg-color': option.bgColor,
                                                '--text-color': option.color,
                                            } as React.CSSProperties}
                                            onClick={() => handleStatusChange(student.id, option.value)}
                                         >
                                            {option.icon && <option.icon className="h-5 w-5" />}
                                         </Button>
                                     ))}
                                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground h-9 w-9 md:h-10 md:w-10 relative" onClick={() => openNoteEditor(student)}>
                                        <MessageSquarePlus className="h-5 w-5"/>
                                        {record.description && <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-primary ring-2 ring-background" />}
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
      </main>

      <Dialog open={!!editingNoteFor} onOpenChange={(isOpen) => !isOpen && setEditingNoteFor(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Öğrenci Notu: {editingNoteFor?.firstName} {editingNoteFor?.lastName}</DialogTitle>
                <DialogDescription>
                    Bu öğrenci için {recordDate ? format(recordDate, 'dd MMMM yyyy', {locale: tr}) : ''} tarihine özel bir not ekleyin.
                </DialogDescription>
            </DialogHeader>
            <Textarea 
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder='Öğrenci hakkında gözlemlerinizi yazın...'
                rows={5}
                className='my-4'
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="ghost">İptal</Button>
                </DialogClose>
                <Button onClick={handleSaveNote}>Notu Kaydet</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
