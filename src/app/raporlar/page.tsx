
'use client';
import * as React from 'react';
import {
  Calendar as CalendarIcon,
  Download,
  BarChart2,
  Users,
  List,
  Loader2,
  FileSearch,
  ChevronDown,
} from 'lucide-react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from "@/components/ui/collapsible"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { format, startOfMonth, isWithinInterval, eachDayOfInterval, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { statusOptions, AttendanceStatus } from '@/lib/types';
import type { Student, ClassInfo, DailyRecord } from '@/lib/types';
import { useClassesAndStudents } from '@/hooks/use-daily-records';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import AuthGuard from '@/components/auth-guard';


const statusToTurkish: Record<string, string> = {
    '+': 'Arti',
    'Y': 'Yarim',
    '-': 'Eksi',
    'D': 'Yok',
    'G': 'Izinli',
    'note': 'Not',
};

type ChartConfig = {
    [key: string]: {
      label: string;
      color: string;
      icon?: React.ComponentType;
    };
  };
  
const chartConfig = {
  puan: {
    label: 'Performans Puani',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;


function RaporlarPageContent() {
  const { user } = useAuth();
  const { classes, isLoading: isClassesLoading } = useClassesAndStudents(user?.uid);
  
  const [students, setStudents] = React.useState<Student[]>([]);
  const [filteredData, setFilteredData] = React.useState<DailyRecord[]>([]);

  const [selectedClassId, setSelectedClassId] = React.useState<string>('');
  const [selectedReportType, setSelectedReportType] = React.useState('bireysel');
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
      from: startOfMonth(new Date()),
      to: new Date(),
  });
  const [isGenerating, setIsGenerating] = React.useState(false);

  const normalizeTurkishChars = (str: string) => {
    if (!str) return '';
    const map: { [key: string]: string } = {
        'ı': 'i', 'İ': 'I', 'ğ': 'g', 'Ğ': 'G', 'ü': 'u', 'Ü': 'U',
        'ş': 's', 'Ş': 'S', 'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C'
    };
    return str.replace(/[ıİğĞüÜşŞöÖçÇ]/g, (char) => map[char]);
  };
  
  // Set initial class
  React.useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  React.useEffect(() => {
    if (!selectedClassId) {
        setStudents([]);
        return;
    };
    const currentClass = classes.find(c => c.id === selectedClassId);
    const sortedStudents = currentClass?.students.sort((a,b) => a.studentNumber - b.studentNumber) || [];
    setStudents(sortedStudents);
    setSelectedStudentId(null);
    setFilteredData([]);
  }, [selectedClassId, classes]);

  const handleGenerateReport = React.useCallback(async () => {
    if (!user?.uid || !selectedClassId || !dateRange?.from || !dateRange?.to) return;
    
    setIsGenerating(true);
    setFilteredData([]);

    try {
        const q = query(collection(db, `users/${user.uid}/classes/${selectedClassId}/records`));
        const querySnapshot = await getDocs(q);
        const allRecords = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as DailyRecord);
        
        const recordsInRange = allRecords.filter(record => {
            const recordDate = parseISO(record.date);
            return isWithinInterval(recordDate, { start: dateRange.from!, end: dateRange.to! });
        });

        setFilteredData(recordsInRange);

    } catch (error) {
        console.error("Error generating report:", error);
    } finally {
        setIsGenerating(false);
    }
  }, [selectedClassId, dateRange, user?.uid]);


  const individualReportData = React.useMemo(() => {
    if (selectedReportType !== 'bireysel' || !selectedStudentId || !dateRange?.from) return null;

    const studentRecords = filteredData.filter(r => r.studentId === selectedStudentId);

    const summary = statusOptions.reduce((acc, option) => {
        acc[option.value] = { count: 0, label: option.label, icon: option.icon };
        return acc;
    }, {} as any);

    const statusEvents: { date: string; type: 'status'; value: string }[] = [];
    const noteEvents: { date: string; type: 'note'; value: string }[] = [];
    const scoresByDate: { [date: string]: number } = {};
    const scoreValues: { [key in AttendanceStatus]: number } = {
        '+': 1, 'Y': 0.5, '-': -1, 'D': 0, 'G': 0,
    };
    
    studentRecords.forEach(record => {
        record.events.forEach(event => {
            if (event.type === 'status') {
                const status = event.value as AttendanceStatus;
                if (summary[status]) {
                    summary[status].count += 1;
                }
                const score = scoresByDate[record.date] || 0;
                scoresByDate[record.date] = score + scoreValues[status];
                statusEvents.push({ date: record.date, type: 'status', value: String(event.value) });
            } else if (event.type === 'note' && event.value) {
                noteEvents.push({ date: record.date, type: 'note', value: String(event.value) });
            }
        });
    });

    const intervalDays = eachDayOfInterval({ start: dateRange.from, end: dateRange.to || dateRange.from });
    let cumulativeScore = 0;
    const chartData = intervalDays.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        cumulativeScore += scoresByDate[dateStr] || 0;
        return {
            date: format(day, 'dd/MM'),
            puan: cumulativeScore,
        };
    });

    return { summary, statusEvents, noteEvents, chartData };
  }, [filteredData, selectedReportType, selectedStudentId, dateRange]);


  const classReportData = React.useMemo(() => {
    if (selectedReportType !== 'sinif') return null;

    const studentSummaries = students.map(student => {
      const studentRecords = filteredData.filter(r => r.studentId === student.id);
      const summary: Record<AttendanceStatus, number> = {
        '+': 0, 'Y': 0, '-': 0, 'D': 0, 'G': 0
      };
      const notes: {date: string, content: string}[] = [];
      
      studentRecords.forEach(record => {
        record.events.forEach(event => {
            if (event.type === 'status' && summary[event.value as AttendanceStatus] !== undefined) {
                summary[event.value as AttendanceStatus]++;
            }
            if (event.type === 'note' && typeof event.value === 'string' && event.value.trim() !== '') {
                notes.push({ date: record.date, content: event.value });
            }
        });
      });
      
      const totalScore = summary['+'] * 1 + summary['Y'] * 0.5 + summary['-'] * -1;
      
      return {
        ...student,
        summary,
        totalScore,
        notes,
      };
    }).sort((a, b) => a.studentNumber - b.studentNumber);
    
    return { studentSummaries };
  }, [filteredData, selectedReportType, students]);


  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFont('PT Sans', 'normal');
    
    const selectedClass = classes.find(c => c.id === selectedClassId);
    const dateTitle = dateRange?.from ? `${format(dateRange.from, "d MMMM yyyy", { locale: tr })} - ${dateRange.to ? format(dateRange.to, "d MMMM yyyy", { locale: tr }) : ''}` : '';
    
    const pageHeader = (data: any) => {
        if (data.pageNumber > 1) {
            return;
        }
        doc.setFont('PT Sans', 'normal');
        doc.setFontSize(18);
        doc.setTextColor(40);
        if (selectedReportType === 'sinif' && classReportData) {
            doc.text(normalizeTurkishChars(`Sinif Raporu: ${selectedClass?.name}`), data.settings.margin.left, 22);
        } else if (selectedReportType === 'bireysel' && individualReportData) {
            const selectedStudent = students.find(s => s.id === selectedStudentId);
            doc.text(normalizeTurkishChars(`Bireysel Rapor: ${selectedStudent?.firstName} ${selectedStudent?.lastName}`), data.settings.margin.left, 22);
        }
    };

    const pageFooter = (data: any) => {
        doc.setFont('PT Sans', 'normal');
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        const text = `Sayfa ${data.pageNumber} / ${pageCount}`;
        const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
        doc.text(text, doc.internal.pageSize.width - data.settings.margin.right - textWidth, doc.internal.pageSize.height - 10);
    };

    const tableStyles: any = {
        font: "PT Sans",
        fontStyle: 'normal',
    };

    if (selectedReportType === 'sinif' && classReportData) {
        const body = [];
        for (const s of classReportData.studentSummaries) {
            body.push([
                s.studentNumber,
                normalizeTurkishChars(`${s.firstName} ${s.lastName}`),
                s.summary['+'],
                s.summary['Y'],
                s.summary['-'],
                s.summary['D'],
                s.summary['G'],
                s.totalScore
            ]);
            if (s.notes.length > 0) {
                const notesText = s.notes.map(n => `  - ${format(parseISO(n.date), 'dd/MM/yy', { locale: tr })}: ${normalizeTurkishChars(n.content)}`).join('\n');
                body.push([{ content: normalizeTurkishChars(`Ogretmen Gorusleri:\n${notesText}`), colSpan: 8, styles: { font: "PT Sans", fontStyle: 'italic', textColor: 60, fontSize: 9 } }]);
            }
        }

        (doc as any).autoTable({
            head: [[normalizeTurkishChars('No'), normalizeTurkishChars('Adi Soyadi'), '+', normalizeTurkishChars('Yarim'), '-', normalizeTurkishChars('Yok'), normalizeTurkishChars('Izinli'), normalizeTurkishChars('Toplam Puan')]],
            body: body,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [33, 150, 243], textColor: 255, ...tableStyles },
            styles: tableStyles,
            alternateRowStyles: { fillColor: [240, 244, 255] },
            didDrawPage: (data: any) => {
                pageHeader(data);
                pageFooter(data);
            }
        });

        doc.save(normalizeTurkishChars(`sinif_raporu_${selectedClass?.name}_${format(new Date(), 'yyyy-MM-dd')}.pdf`));
    } else if (selectedReportType === 'bireysel' && individualReportData) {
        const selectedStudent = students.find(s => s.id === selectedStudentId);
        
        doc.setFont('PT Sans', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(normalizeTurkishChars(`Sinif: ${selectedClass?.name}`), 14, 32);
        doc.text(normalizeTurkishChars(`Rapor Tarih Araligi: ${dateTitle}`), 14, 38);
        
        const summaryText = Object.entries(individualReportData.summary)
            .map(([key, value]: [string, any]) => `${normalizeTurkishChars(value.label)}: ${value.count}`)
            .join(' | ');
        
        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.text(normalizeTurkishChars('Genel Durum Ozeti'), 14, 50);
        doc.setFont('PT Sans', 'normal');
        doc.setFontSize(10);
        doc.text(summaryText, 14, 56);

        if (individualReportData.statusEvents.length > 0) {
            (doc as any).autoTable({
                startY: 65,
                head: [[normalizeTurkishChars('Tarih'), normalizeTurkishChars('Durum')]],
                body: individualReportData.statusEvents.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(e => {
                    const statusKey = e.type === 'status' ? e.value : e.type;
                    return [
                        normalizeTurkishChars(format(parseISO(e.date), 'd MMMM yyyy, cccc', { locale: tr })),
                        normalizeTurkishChars(statusToTurkish[statusKey] || 'Belirtilmemis'),
                    ];
                }),
                theme: 'striped',
                headStyles: { fillColor: [33, 150, 243], textColor: 255, ...tableStyles },
                styles: tableStyles,
                didDrawPage: (data: any) => {
                    pageHeader(data);
                    pageFooter(data);
                }
            });
        } 
        
        if (individualReportData.noteEvents.length > 0) {
            const lastTable = (doc as any).lastAutoTable;
            const startY = lastTable ? lastTable.finalY + 10 : 65;
            (doc as any).autoTable({
                startY: startY,
                head: [[normalizeTurkishChars('Tarih'), normalizeTurkishChars('Ogretmen Gorusleri')]],
                body: individualReportData.noteEvents.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(e => [
                    normalizeTurkishChars(format(parseISO(e.date), 'd MMMM yyyy, cccc', { locale: tr })),
                    normalizeTurkishChars(e.value)
                ]),
                theme: 'striped',
                headStyles: { fillColor: [33, 150, 243], textColor: 255, ...tableStyles },
                styles: tableStyles,
                didDrawPage: (data: any) => {
                    if(!lastTable) pageHeader(data);
                    pageFooter(data);
                }
            });
        }
        
        if (individualReportData.statusEvents.length === 0 && individualReportData.noteEvents.length === 0) {
            pageHeader({ settings: { margin: { left: 14 } } });
            pageFooter({ pageNumber: 1, settings: { margin: { right: 14 } } });
        }

        doc.save(normalizeTurkishChars(`bireysel_rapor_${selectedStudent?.firstName}_${selectedStudent?.lastName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`));
    }
  };

  const isLoading = isClassesLoading || isGenerating;
  
  const renderReportContent = () => {
    if (isLoading) {
        return (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
    }
    
    if (filteredData.length === 0) {
        return (
            <div className="text-center py-10 px-4 text-muted-foreground">
                <FileSearch className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">Rapor Bekleniyor</h3>
                <p className="mt-2 text-sm">Rapor oluşturmak için yukarıdaki filtreleri kullanın ve "Raporu Oluştur" düğmesine tıklayın.</p>
            </div>
        )
    }

    if (selectedReportType === 'bireysel' && !individualReportData) {
        return (
            <div className="text-center py-10 px-4 text-muted-foreground">
                <Users className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">Öğrenci Seçin</h3>
                <p className="mt-2 text-sm">Bireysel raporu görüntülemek için lütfen bir öğrenci seçin.</p>
            </div>
        )
    }
    
    if(selectedReportType === 'bireysel' && individualReportData){
      const { summary, statusEvents, noteEvents, chartData } = individualReportData;
      const selectedStudent = students.find(s => s.id === selectedStudentId);

      return (
        <Card>
            <CardHeader className='flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                <div>
                    <CardTitle>Bireysel Rapor: {selectedStudent?.firstName} {selectedStudent?.lastName}</CardTitle>
                    <CardDescription>Aşağıda öğrencinin seçilen tarih aralığındaki performansını görebilirsiniz.</CardDescription>
                </div>
                 <Button variant="outline" onClick={handleDownloadPdf}>
                    <Download className="mr-2 h-4 w-4" />
                    PDF İndir
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
                    {Object.entries(summary).map(([key, value]: [string, any]) => (
                        <Card key={key} className="p-4">
                            <div className="flex justify-center items-center mb-2">
                                {value.icon && <value.icon className={cn("h-6 w-6", statusOptions.find(o => o.value === key)?.color)} />}
                            </div>
                            <p className="text-2xl font-bold">{value.count}</p>
                            <p className="text-sm text-muted-foreground">{value.label}</p>
                        </Card>
                    ))}
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Performans Grafiği</CardTitle>
                         <CardDescription>Öğrencinin seçilen tarih aralığındaki kümülatif performans puanı trendi.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis domain={['auto', 'auto']} allowDecimals={false} />
                                    <RechartsTooltip 
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--background))',
                                            borderColor: 'hsl(var(--border))'
                                        }}
                                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <ChartLegend content={<ChartLegendContent />} />
                                    <Line type="monotone" dataKey="puan" stroke="var(--color-puan)" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Değerlendirme Geçmişi</CardTitle>
                        <CardDescription>Seçilen tarih aralığındaki durum işaretlemeleri.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                                {statusEvents.length > 0 ? statusEvents.sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).map((event, index) => {
                                    const statusKey = event.type === 'status' ? event.value : event.type;
                                    const statusOption = statusOptions.find(o => o.value === statusKey);

                                    return (
                                    <div key={`${event.date}-${index}`} className="flex items-start gap-4">
                                        <div className="font-semibold text-center w-28 flex-shrink-0">
                                            <p>{format(parseISO(event.date), 'dd MMMM', { locale: tr })}</p>
                                            <p className="text-xs text-muted-foreground">{format(parseISO(event.date), 'cccc', { locale: tr })}</p>
                                        </div>
                                        <div className="border-l pl-4 flex-1">
                                            <p className="font-medium flex items-center gap-2">
                                            {event.type === 'status' && statusOption?.icon &&
                                                    React.createElement(statusOption.icon, {
                                                        className: cn("h-5 w-5", statusOption.color)
                                                    })
                                            }
                                                <span>{statusToTurkish[statusKey] || 'Belirtilmemiş'}</span>
                                            </p>
                                        </div>
                                    </div>
                                )}) : <p className="text-muted-foreground">Bu tarih aralığında durum değerlendirmesi bulunmuyor.</p>}
                        </div>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Öğretmen Görüşleri</CardTitle>
                        <CardDescription>Seçilen tarih aralığında eklenen öğretmen notları.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                                {noteEvents.length > 0 ? noteEvents.sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).map((event, index) => (
                                    <div key={`${event.date}-${index}`} className="flex items-start gap-4">
                                        <div className="font-semibold text-center w-28 flex-shrink-0">
                                            <p>{format(parseISO(event.date), 'dd MMMM', { locale: tr })}</p>
                                            <p className="text-xs text-muted-foreground">{format(parseISO(event.date), 'cccc', { locale: tr })}</p>
                                        </div>
                                        <div className="border-l pl-4 flex-1">
                                            <p className="text-sm text-foreground">{event.value}</p>
                                        </div>
                                    </div>
                                )) : <p className="text-muted-foreground">Bu tarih aralığında öğretmen görüşü bulunmuyor.</p>}
                        </div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
      )
    }

    if(selectedReportType === 'sinif' && classReportData){
        return (
            <Card>
                <CardHeader className='flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                    <div>
                        <CardTitle>Sınıf Geneli Performans Raporu</CardTitle>
                        <CardDescription>
                            Seçilen tarih aralığında öğrencilerin aldığı işaretler ve toplam puanları.
                        </CardDescription>
                    </div>
                    <Button variant="outline" onClick={handleDownloadPdf}>
                        <Download className="mr-2 h-4 w-4" />
                        PDF İndir
                    </Button>
                </CardHeader>
                <CardContent className="overflow-x-auto no-scrollbar">
                    <Table className="min-w-[800px]">
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">No</TableHead>
                            <TableHead>Adı Soyadı</TableHead>
                            {statusOptions.map(opt => (
                                <TableHead key={opt.value} className="text-center">{opt.label}</TableHead>
                            ))}
                            <TableHead className="text-right w-[120px]">Toplam Puan</TableHead>
                            <TableHead className="w-[50px] text-center">Notlar</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classReportData.studentSummaries.map(student => (
                                <Collapsible key={student.id} asChild>
                                    <>
                                        <TableRow>
                                            <TableCell className="font-medium">{student.studentNumber}</TableCell>
                                            <TableCell>{student.firstName} {student.lastName}</TableCell>
                                            {statusOptions.map(opt => (
                                                <TableCell key={opt.value} className="text-center">{student.summary[opt.value as AttendanceStatus]}</TableCell>
                                            ))}
                                            <TableCell className="text-right font-bold">{student.totalScore}</TableCell>
                                            <TableCell className="text-center">
                                                <CollapsibleTrigger asChild>
                                                    {student.notes.length > 0 ? (
                                                        <Button variant="ghost" size="sm">
                                                            <ChevronDown className="h-4 w-4" />
                                                            <span className='ml-1'>{student.notes.length}</span>
                                                        </Button>
                                                    ) : null}
                                                </CollapsibleTrigger>
                                            </TableCell>
                                        </TableRow>
                                        <CollapsibleContent asChild>
                                        <TableRow>
                                            <TableCell colSpan={9}>
                                                <div className='p-4 bg-muted/50 rounded-md'>
                                                    <h4 className='font-semibold mb-2'>Öğretmen Görüşleri</h4>
                                                    <ul className='space-y-2 list-disc list-inside text-sm'>
                                                    {student.notes.map((note, idx) => (
                                                        <li key={idx}>
                                                            <span className='font-semibold'>{format(parseISO(note.date), 'dd MMM yyyy', {locale: tr})}:</span> {note.content}
                                                        </li>
                                                    ))}
                                                    </ul>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        </CollapsibleContent>
                                    </>
                                </Collapsible>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )
    }

    return null;
  }
  
  return (
    <AppLayout>
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Raporlar</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rapor Oluştur</CardTitle>
            <CardDescription>Rapor oluşturmak için aşağıdaki kriterleri seçin.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="space-y-1">
                <Label htmlFor="class-select">Sınıf</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger id="class-select">
                    <SelectValue placeholder="Sınıf seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="report-type">Rapor Türü</Label>
                <Select value={selectedReportType} onValueChange={(value) => {
                    setSelectedReportType(value);
                    setFilteredData([]);
                }}>
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Rapor türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bireysel">Bireysel Öğrenci Raporu</SelectItem>
                    <SelectItem value="sinif">Sınıf Raporu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1" style={{ display: selectedReportType === 'bireysel' ? 'block' : 'none' }}>
                <Label htmlFor="student-select">Öğrenci</Label>
                <Select value={selectedStudentId || ''} onValueChange={setSelectedStudentId} disabled={students.length === 0}>
                  <SelectTrigger id="student-select">
                    <SelectValue placeholder="Öğrenci seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(s => <SelectItem key={s.id} value={s.id}>{s.studentNumber} - {s.firstName} {s.lastName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Tarih Aralığı</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                        dateRange.to ? (
                            <>
                            {format(dateRange.from, "dd MMMM yyyy", { locale: tr })} -{' '}
                            {format(dateRange.to, "dd MMMM yyyy", { locale: tr })}
                            </>
                        ) : (
                            format(dateRange.from, "dd MMMM yyyy", { locale: tr })
                        )
                        ) : (
                        <span>Tarih aralığı seçin</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        locale={tr}
                    />
                    </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSearch className="mr-2 h-4 w-4" />}
                Raporu Oluştur
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-6">
            {renderReportContent()}
        </div>
      </main>
    </AppLayout>
  );
}

export default function RaporlarPage() {
    return (
      <AuthGuard>
        <RaporlarPageContent />
      </AuthGuard>
    );
  }

