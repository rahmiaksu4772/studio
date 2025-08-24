
'use client';

import * as React from 'react';
import {
  FileText,
  Calendar as CalendarIcon,
  Loader2,
  MessageSquarePlus,
  Users,
  AlertTriangle,
  FilePenLine,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import type { Student, DailyRecord, AttendanceStatus, ClassInfo, RecordEvent } from '@/lib/types';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export default function GunlukTakipPage() {
  const { toast } = useToast();
  const { classes, isLoading: isClassesLoading } = useClassesAndStudents();
  const { 
      records, 
      addEvent, 
      addBulkEvents,
      removeEvent, 
      isLoading: isRecordsLoading, 
      getRecordsForDate 
    } = useDailyRecords();
  
  const [students, setStudents] = React.useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = React.useState<ClassInfo | null>(null);
  const [recordDate, setRecordDate] = React.useState<Date | null>(new Date());
  
  const [editingNoteFor, setEditingNoteFor] = React.useState<Student | null>(null);
  const [currentNote, setCurrentNote] = React.useState('');
  
  const [isBulkNoteOpen, setIsBulkNoteOpen] = React.useState(false);
  const [bulkNoteContent, setBulkNoteContent] = React.useState('');

  const dateStr = recordDate ? format(recordDate, 'yyyy-MM-dd') : '';
  const dailyRecords = selectedClass ? getRecordsForDate(selectedClass.id, dateStr) : [];
  
  const recordsByStudentId = React.useMemo(() => {
    return dailyRecords.reduce((acc, record) => {
        acc[record.studentId] = record;
        return acc;
    }, {} as Record<string, DailyRecord>)
  }, [dailyRecords]);


  // Set initial class
  React.useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0]);
    }
  }, [classes, selectedClass]);
  
  // Fetch students when class changes
  React.useEffect(() => {
    if (!selectedClass) return;
    
    const currentClass = classes.find(c => c.id === selectedClass.id);
    const sortedStudents = currentClass?.students.sort((a, b) => a.studentNumber - b.studentNumber) || [];
    setStudents(sortedStudents);

  }, [selectedClass, classes]);


  const handleStatusClick = (studentId: string, status: AttendanceStatus) => {
    if (!selectedClass || !dateStr) return;
    addEvent(selectedClass.id, studentId, dateStr, { type: 'status', value: status });
    toast({
        title: "Durum Eklendi",
        description: `Öğrenci için "${statusOptions.find(o => o.value === status)?.label}" durumu kaydedildi.`,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    });
  };

  const handleSetAllStatus = (status: AttendanceStatus) => {
    if (!selectedClass || !dateStr) return;

    const studentIds = students.map(s => s.id);
    addBulkEvents(selectedClass.id, studentIds, dateStr, { type: 'status', value: status });
    
    toast({
        title: "Tüm Sınıfa Durum Atandı",
        description: `Tüm öğrenciler "${statusOptions.find(o => o.value === status)?.label}" olarak işaretlendi.`
    })
  };
  
  const handleRemoveEvent = (studentId: string, eventId: string) => {
    if (!selectedClass || !dateStr) return;
    removeEvent(selectedClass.id, studentId, dateStr, eventId);
     toast({
        title: "Değerlendirme Silindi",
        description: "Seçilen değerlendirme kayıtlardan kaldırıldı.",
        variant: "destructive"
    });
  }

  const openNoteEditor = (student: Student) => {
    setEditingNoteFor(student);
    const existingNote = recordsByStudentId[student.id]?.events.find(e => e.type === 'note');
    setCurrentNote(existingNote ? existingNote.value : '');
  }

  const handleSaveNote = () => {
    if (!editingNoteFor || !selectedClass || !dateStr) return;
    
    // As a business rule, we'll allow only one note per day to avoid clutter.
    // So we remove the previous note event if it exists.
    const existingRecord = recordsByStudentId[editingNoteFor.id];
    const existingNoteEvent = existingRecord?.events.find(e => e.type === 'note');
    if (existingNoteEvent) {
        removeEvent(selectedClass.id, editingNoteFor.id, dateStr, existingNoteEvent.id);
    }
    
    // Add the new note if it's not empty
    if (currentNote.trim()) {
        addEvent(selectedClass.id, editingNoteFor.id, dateStr, { type: 'note', value: currentNote });
        toast({
            title: "Not Kaydedildi",
            description: `${editingNoteFor.firstName} için not kaydedildi.`
        });
    } else if (existingNoteEvent) {
        // If the new note is empty, but an old one existed, it means the user deleted the text.
        toast({
            title: "Not Kaldırıldı",
            description: `${editingNoteFor.firstName} için not kaldırıldı.`
        });
    }

    setEditingNoteFor(null);
    setCurrentNote('');
  }

  const handleSetAllDescriptions = () => {
    if (!selectedClass || !dateStr || bulkNoteContent.trim() === '') {
        toast({
            title: "Açıklama Boş",
            description: "Lütfen tüm sınıfa uygulamak için bir açıklama girin.",
            variant: "destructive",
        });
        return;
    }
    
    const studentIds = students.map(s => s.id);
    
    // As a business rule, we will overwrite existing notes when setting a bulk note.
    // First, remove all existing notes for the day.
     studentIds.forEach(studentId => {
        const existingRecord = recordsByStudentId[studentId];
        const existingNoteEvent = existingRecord?.events.find(e => e.type === 'note');
        if (existingNoteEvent) {
            removeEvent(selectedClass.id, studentId, dateStr, existingNoteEvent.id);
        }
     });

    // Then, add the new bulk note for everyone.
    addBulkEvents(selectedClass.id, studentIds, dateStr, { type: 'note', value: bulkNoteContent });

    toast({
        title: "Toplu Açıklama Eklendi",
        description: `Tüm öğrencilere aynı açıklama eklendi.`
    });
    setIsBulkNoteOpen(false);
    setBulkNoteContent('');
  };

  const isLoading = isClassesLoading || isRecordsLoading;

  if (isLoading && !selectedClass) {
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
                  disabled={!classes || classes.length === 0}
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

        <Card>
            <CardContent className="p-2 md:p-4">
                <div className="space-y-1">
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-2 py-2 text-sm font-medium text-muted-foreground border-b">
                       <div>No</div>
                       <div>Adı Soyadı</div>
                       <div className='text-center flex items-center justify-end gap-1'>
                            <span className='text-xs mr-2 hidden sm:inline'>Tümüne:</span>
                            {statusOptions.map(option => (
                               <AlertDialog key={`set-all-${option.value}`}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size='icon'
                                        className={cn('rounded-full w-8 h-8 transition-all hover:bg-muted')}
                                        style={{'--bg-color': option.bgColor, '--text-color': option.color} as React.CSSProperties}
                                    >
                                        {option.icon && <option.icon className="h-5 w-5" style={{ color: option.color }} />}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className='flex items-center gap-2'>
                                            <AlertTriangle className='text-yellow-500'/>
                                            Tüm Sınıfa Durum Ata
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Bu işlem tüm öğrencilere birer adet <strong>"{option.label}"</strong> durumu ekleyecektir. Emin misiniz?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>İptal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleSetAllStatus(option.value)}>Evet, Uygula</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            ))}
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full w-8 h-8"
                                onClick={() => setIsBulkNoteOpen(true)}
                            >
                                <FilePenLine className="h-5 w-5 text-muted-foreground" />
                            </Button>
                       </div>
                    </div>
                    {students.map(student => {
                        const record = recordsByStudentId[student.id];
                        const noteEvent = record?.events.find(e => e.type === 'note');

                        return (
                            <div key={student.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-2 py-3 border-b last:border-none hover:bg-muted/50 rounded-md">
                                <div className="font-medium text-muted-foreground w-8 text-center">{student.studentNumber}</div>
                                <div className='font-semibold'>{student.firstName} {student.lastName}</div>
                                <div className="flex items-center justify-end gap-1 md:gap-2">
                                     <div className="flex items-center border-l-2 pl-1.5 gap-1">
                                     {statusOptions.map(option => (
                                         <Button
                                            key={option.value}
                                            variant='outline'
                                            size='icon'
                                            className='rounded-full w-9 h-9 md:w-10 md:h-10 transition-all'
                                            style={{
                                                '--bg-color': option.bgColor,
                                                '--text-color': option.color,
                                            } as React.CSSProperties}
                                            onClick={() => handleStatusClick(student.id, option.value)}
                                         >
                                            {option.icon && <option.icon className="h-5 w-5" />}
                                         </Button>
                                     ))}
                                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground h-9 w-9 md:h-10 md:h-10 relative" onClick={() => openNoteEditor(student)}>
                                        <MessageSquarePlus className="h-5 w-5"/>
                                        {noteEvent && <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-primary ring-2 ring-background" />}
                                    </Button>
                                    </div>
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
                    Bu öğrenci için {recordDate ? format(recordDate, 'dd MMMM yyyy', {locale: tr}) : ''} tarihine özel bir not ekleyin. Mevcut notun üzerine yazılacaktır.
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
      
      <Dialog open={isBulkNoteOpen} onOpenChange={setIsBulkNoteOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Tüm Sınıfa Açıklama Ekle</DialogTitle>
                <DialogDescription>
                    Aşağıya yazdığınız açıklama, seçili sınıftaki tüm öğrencilere uygulanacaktır. Bu işlem mevcut açıklamaların üzerine yazacaktır.
                </DialogDescription>
            </DialogHeader>
            <Textarea 
                value={bulkNoteContent}
                onChange={(e) => setBulkNoteContent(e.target.value)}
                placeholder='Tüm sınıf için ortak bir açıklama yazın...'
                rows={5}
                className='my-4'
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="ghost">İptal</Button>
                </DialogClose>
                <Button onClick={handleSetAllDescriptions}>Tümüne Uygula</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}

    

    
