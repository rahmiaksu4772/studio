
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
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { format, startOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { statusOptions, AttendanceStatus } from '@/lib/types';
import type { Student, ClassInfo, DailyRecord } from '@/lib/types';
import { useClassesAndStudents, useDailyRecords } from '@/hooks/use-daily-records';
import { liberationSansNormal } from '@/lib/fonts';


const statusToTurkish: Record<string, string> = {
    '+': 'Artı',
    'Y': 'Yarım',
    '-': 'Eksi',
    'D': 'Yok',
    'G': 'İzinli',
    'note': 'Not',
};

const chartConfig = {
  views: {
    label: 'Durumlar',
  },
  ...statusOptions.reduce((acc, option) => {
    let color = 'hsl(var(--primary))'; // default
    if (option.value === '+') color = 'hsl(142 71% 45%)';
    if (option.value === 'Y') color = 'hsl(142 60% 65%)';
    if (option.value === '-') color = 'hsl(0 72% 51%)';
    if (option.value === 'D') color = 'hsl(48 96% 53%)';
    if (option.value === 'G') color = 'hsl(221 83% 53%)';

    acc[option.value] = {
      label: option.label,
      color: color,
    };
    return acc;
  }, {} as any)
} satisfies ChartConfig;


export default function RaporlarPage() {
  const { classes, isLoading: isClassesLoading } = useClassesAndStudents();
  const { records, isLoading: isRecordsLoading } = useDailyRecords();
  
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
  
  // Set initial class
  React.useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  React.useEffect(() => {
    if (!selectedClassId) return;
    const currentClass = classes.find(c => c.id === selectedClassId);
    const sortedStudents = currentClass?.students.sort((a,b) => a.studentNumber - b.studentNumber) || [];
    setStudents(sortedStudents);
    setSelectedStudentId(null);
  }, [selectedClassId, classes]);

  const handleGenerateReport = React.useCallback(() => {
    if (!selectedClassId || !dateRange?.from) return;
    
    setIsGenerating(true);
    try {
        const startDate = dateRange.from;
        const endDate = dateRange.to || dateRange.from;
        
        const filteredRecords = records.filter(record => {
            const recordDate = new Date(record.date);
            return (
                record.classId === selectedClassId &&
                recordDate >= startDate &&
                recordDate <= endDate &&
                record.events.length > 0
            );
        });

        setFilteredData(filteredRecords);
    } catch (error) {
        console.error("Error generating report:", error);
    } finally {
        setIsGenerating(false);
    }
  }, [selectedClassId, dateRange, records]);


  const individualReportData = React.useMemo(() => {
      if (selectedReportType !== 'bireysel' || !selectedStudentId) return null;
      
      const studentRecords = filteredData.filter(r => r.studentId === selectedStudentId);

      const summary = statusOptions.reduce((acc, option) => {
          acc[option.value] = { count: 0, label: option.label, icon: option.icon };
          return acc;
      }, {} as any);

      const dateMap: { [key: string]: { date: string, [key: string]: number | string } } = {};
      const allEvents: {date: string, type: 'status' | 'note', value: string}[] = [];

      studentRecords.forEach(record => {
          record.events.forEach(event => {
              if (event.type === 'status') {
                if (summary[event.value]) {
                    summary[event.value].count += 1;
                }

                const formattedDate = format(new Date(record.date), 'dd/MM');
                if (!dateMap[formattedDate]) {
                    dateMap[formattedDate] = { date: formattedDate };
                    statusOptions.forEach(opt => dateMap[formattedDate][opt.value] = 0);
                }
                (dateMap[formattedDate][event.value] as number) += 1;
              }
              allEvents.push({ date: record.date, ...event });
          })
      });
      
      return { summary, events: allEvents, chartData: Object.values(dateMap) };
  }, [filteredData, selectedReportType, selectedStudentId]);

  const classReportData = React.useMemo(() => {
    if (selectedReportType !== 'sinif') return null;

    const studentSummaries = students.map(student => {
      const studentRecords = filteredData.filter(r => r.studentId === student.id);
      const summary: Record<AttendanceStatus, number> = {
        '+': 0, 'Y': 0, '-': 0, 'D': 0, 'G': 0
      };
      
      studentRecords.forEach(record => {
        record.events.forEach(event => {
            if (event.type === 'status' && summary[event.value as AttendanceStatus] !== undefined) {
                summary[event.value as AttendanceStatus]++;
            }
        });
      });
      
      const totalScore = summary['+'] * 10 + summary['Y'] * 5 + summary['-'] * -5;
      
      return {
        ...student,
        summary,
        totalScore
      };
    }).sort((a, b) => a.studentNumber - b.studentNumber);
    
    return { studentSummaries };
  }, [filteredData, selectedReportType, students]);


  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    
    // Add the custom font
    doc.addFileToVFS('liberation-sans.ttf', liberationSansNormal);
    doc.addFont('liberation-sans.ttf', 'liberation-sans', 'normal');
    doc.setFont('liberation-sans');

    const selectedClass = classes.find(c => c.id === selectedClassId);
    const dateTitle = dateRange?.from ? `${format(dateRange.from, "d MMMM yyyy", { locale: tr })} - ${dateRange.to ? format(dateRange.to, "d MMMM yyyy", { locale: tr }) : ''}` : '';
    
    const pageHeader = (data: any) => {
        doc.setFontSize(18);
        doc.setTextColor(40);
        if (selectedReportType === 'sinif' && classReportData) {
            doc.text(`Sınıf Raporu: ${selectedClass?.name}`, data.settings.margin.left, 22);
        } else if (selectedReportType === 'bireysel' && individualReportData) {
            const selectedStudent = students.find(s => s.id === selectedStudentId);
            doc.text(`Bireysel Rapor: ${selectedStudent?.firstName} ${selectedStudent?.lastName}`, data.settings.margin.left, 22);
        }
    };

    const pageFooter = (data: any) => {
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        const text = `Sayfa ${data.pageNumber} / ${pageCount}`;
        const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
        doc.text(text, doc.internal.pageSize.width - data.settings.margin.right - textWidth, doc.internal.pageSize.height - 10);
    };

    if (selectedReportType === 'sinif' && classReportData) {
        const tableData = classReportData.studentSummaries.map(s => [
            s.studentNumber,
            `${s.firstName} ${s.lastName}`,
            s.summary['+'],
            s.summary['Y'],
            s.summary['-'],
            s.summary['D'],
            s.summary['G'],
            s.totalScore
        ]);

        (doc as any).autoTable({
            head: [['No', 'Adı Soyadı', '+', 'Yarım', '-', 'Yok', 'İzinli', 'Toplam Puan']],
            body: tableData,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [33, 150, 243], textColor: 255, font: 'liberation-sans' },
            styles: { font: 'liberation-sans' },
            alternateRowStyles: { fillColor: [240, 244, 255] },
            didDrawPage: (data: any) => {
                pageHeader(data);
                pageFooter(data);
            }
        });

        doc.save(`sinif_raporu_${selectedClass?.name}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } else if (selectedReportType === 'bireysel' && individualReportData) {
        const selectedStudent = students.find(s => s.id === selectedStudentId);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Sınıf: ${selectedClass?.name}`, 14, 32);
        doc.text(`Rapor Tarih Aralığı: ${dateTitle}`, 14, 38);
        
        const summaryText = Object.entries(individualReportData.summary)
            .map(([key, value]: [string, any]) => `${value.label}: ${value.count}`)
            .join(' | ');
        
        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.text('Genel Durum Özeti', 14, 50);
        doc.setFontSize(10);
        doc.text(summaryText, 14, 56);

        if (individualReportData.events.length > 0) {
            (doc as any).autoTable({
                startY: 65,
                head: [['Tarih', 'Durum', 'Açıklama']],
                body: individualReportData.events.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(e => {
                    const statusKey = e.type === 'status' ? e.value : e.type;
                    return [
                        format(new Date(e.date), 'd MMM yyyy, cccc', { locale: tr }),
                        statusToTurkish[statusKey] || 'Belirtilmemiş',
                        e.type === 'note' ? e.value : '-'
                    ];
                }),
                theme: 'striped',
                headStyles: { fillColor: [33, 150, 243], textColor: 255, font: 'liberation-sans' },
                styles: { font: 'liberation-sans' },
                didDrawPage: (data: any) => {
                    pageHeader(data);
                    pageFooter(data);
                }
            });
        } else {
            pageHeader({ settings: { margin: { left: 14 } } });
            pageFooter({ pageNumber: 1, settings: { margin: { right: 14 } } });
        }
        doc.save(`bireysel_rapor_${selectedStudent?.firstName}_${selectedStudent?.lastName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    }
  };

  const isLoading = isClassesLoading || isRecordsLoading;
  
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
      const { summary, events, chartData } = individualReportData;
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
                        <CardTitle>İstatistik Grafiği</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis allowDecimals={false} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <ChartLegend />
                                    {statusOptions.map(opt => (
                                        <Bar key={opt.value} dataKey={opt.value} fill={`var(--color-${opt.value})`} stackId="a" radius={[4, 4, 0, 0]} name={opt.label} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Değerlendirme Geçmişi</CardTitle>
                        <CardDescription>Seçilen tarih aralığındaki tüm olaylar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                            {events.length > 0 ? events.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((event, index) => {
                                const statusKey = event.type === 'status' ? event.value : event.type;
                                const statusOption = statusOptions.find(o => o.value === statusKey);

                                return (
                                <div key={`${event.date}-${index}`} className="flex items-start gap-4">
                                    <div className="font-semibold text-center w-20 flex-shrink-0">
                                        <p>{format(new Date(event.date), 'dd MMMM', { locale: tr })}</p>
                                        <p className="text-xs text-muted-foreground">{format(new Date(event.date), 'cccc', { locale: tr })}</p>
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
                                        {event.type === 'note' && <p className="text-sm text-muted-foreground">{event.value || "Ek bir not girilmemiş."}</p>}
                                    </div>
                                </div>
                            )}) : <p>Bu tarih aralığında not bulunmuyor.</p>}
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
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">No</TableHead>
                                    <TableHead>Adı Soyadı</TableHead>
                                    {statusOptions.map(opt => (
                                        <TableHead key={opt.value} className="text-center">{opt.label}</TableHead>
                                    ))}
                                    <TableHead className="text-right">Toplam Puan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {classReportData.studentSummaries.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.studentNumber}</TableCell>
                                        <TableCell>{student.firstName} {student.lastName}</TableCell>
                                        {statusOptions.map(opt => (
                                            <TableCell key={opt.value} className="text-center">{student.summary[opt.value]}</TableCell>
                                        ))}
                                        <TableCell className="text-right font-bold">{student.totalScore}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
