
'use client';
import * as React from 'react';
import {
  Calendar as CalendarIcon,
  Download,
  BarChart2,
  PieChart,
  List,
  Loader2,
} from 'lucide-react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { format, startOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';

import { classes, students, dailyRecords } from '@/lib/mock-data';
import { statusOptions } from '@/lib/types';

const statusToTurkish: Record<string, string> = {
    '+': 'Artı',
    'P': 'Yarım Artı',
    '-': 'Eksi',
    'Y': 'Yok',
    'G': 'İzinli',
};

const chartConfig = {
  views: {
    label: 'Durumlar',
  },
  ...statusOptions.reduce((acc, option) => {
    acc[option.value] = {
      label: option.label,
      color: option.color?.startsWith('text-') ? `hsl(var(--${option.color.split('-')[1]}-600))` : 'hsl(var(--primary))',
    };
    // A bit of a hack to map tailwind colors to HSL vars for the chart
    if (option.color === 'text-green-600') acc[option.value].color = 'hsl(142 71% 45%)';
    if (option.color === 'text-green-500') acc[option.value].color = 'hsl(142 60% 65%)';
    if (option.color === 'text-red-600') acc[option.value].color = 'hsl(0 72% 51%)';
    if (option.color === 'text-yellow-600') acc[option.value].color = 'hsl(48 96% 53%)';
    if (option.color === 'text-blue-600') acc[option.value].color = 'hsl(221 83% 53%)';
    return acc;
  }, {} as any)
} satisfies ChartConfig;


export default function RaporlarPage() {
  const [selectedClassId, setSelectedClassId] = React.useState<string>(classes[0].id);
  const [selectedReportType, setSelectedReportType] = React.useState('bireysel');
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);

  React.useEffect(() => {
    setDateRange({
      from: startOfMonth(new Date()),
      to: new Date(),
    });
  }, []);

  const availableStudents = students.filter(s => s.classId === selectedClassId);

  React.useEffect(() => {
    setSelectedStudentId(null);
  }, [selectedClassId]);

  const filteredData = React.useMemo(() => {
    if (!dateRange?.from) return [];
    return dailyRecords.filter(record => {
      const recordDate = new Date(record.date);
      const fromDate = new Date(dateRange.from!);
      const toDate = dateRange.to ? new Date(dateRange.to) : new Date();

      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
      
      const isClassMatch = record.classId === selectedClassId;
      const isDateMatch = recordDate >= fromDate && recordDate <= toDate;
      const isStudentMatch = selectedReportType === 'bireysel' && selectedStudentId ? record.studentId === selectedStudentId : true;
      
      return isClassMatch && isDateMatch && isStudentMatch;
    });
  }, [selectedClassId, selectedStudentId, selectedReportType, dateRange]);


  const individualReportData = React.useMemo(() => {
      if (selectedReportType !== 'bireysel' || !selectedStudentId) return null;
      
      const summary = statusOptions.reduce((acc, option) => {
          acc[option.value] = { count: 0, label: option.label, icon: option.icon };
          return acc;
      }, {} as any);

      const dateMap: { [key: string]: { date: string, [key: string]: number | string } } = {};

      filteredData.forEach(record => {
          if (record.status && summary[record.status]) {
              summary[record.status].count += 1;
          }

          const formattedDate = format(new Date(record.date), 'dd/MM');
          if (!dateMap[formattedDate]) {
            dateMap[formattedDate] = { date: formattedDate };
            statusOptions.forEach(opt => dateMap[formattedDate][opt.value] = 0);
          }
          if (record.status) {
            (dateMap[formattedDate][record.status] as number) += 1;
          }
      });
      
      return { summary, records: filteredData, chartData: Object.values(dateMap) };
  }, [filteredData, selectedReportType, selectedStudentId]);

  const classReportData = React.useMemo(() => {
    if (selectedReportType !== 'sinif') return null;

     const dataByStatus = statusOptions.map(option => ({
      name: option.label,
      value: filteredData.filter(d => d.status === option.value).length,
      fill: chartConfig[option.value]?.color
    }));
    
    return { dataByStatus };
  }, [filteredData, selectedReportType]);


  const renderReportContent = () => {
    if (!dateRange) {
        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
    }

    if (selectedReportType === 'bireysel' && !selectedStudentId) {
        return <div className="text-center p-8 text-muted-foreground">Raporu görüntülemek için lütfen bir öğrenci seçin.</div>
    }
    
    if (filteredData.length === 0) {
        return <div className="text-center p-8 text-muted-foreground">Seçilen kriterlere uygun veri bulunamadı.</div>
    }

    if(selectedReportType === 'bireysel' && individualReportData){
      const { summary, records, chartData } = individualReportData;
      return (
        <div className="space-y-6">
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
                    <CardTitle className="flex items-center gap-2"><BarChart2 /> İstatistik Grafiği</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend />
                            {statusOptions.map(opt => (
                                <Bar key={opt.value} dataKey={opt.value} fill={chartConfig[opt.value]?.color} stackId="a" radius={[4, 4, 0, 0]} name={opt.label} />
                            ))}
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><List /> Günlük Notlar</CardTitle>
                    <CardDescription>Seçilen tarih aralığındaki gözlemler.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4 max-h-96 overflow-y-auto">
                        {records.length > 0 ? records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                            <div key={record.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                                <div className="font-semibold text-center w-24">
                                    <p>{format(new Date(record.date), 'dd MMMM', { locale: tr })}</p>
                                    <p className="text-xs text-muted-foreground">{format(new Date(record.date), 'cccc', { locale: tr })}</p>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium flex items-center gap-2">
                                       {record.status && statusOptions.find(o=>o.value === record.status)?.icon &&
                                            React.createElement(statusOptions.find(o=>o.value === record.status)!.icon!, {
                                                className: cn("h-5 w-5", statusOptions.find(o => o.value === record.status)?.color)
                                            })
                                       }
                                        <span>{statusToTurkish[record.status!] || 'Belirtilmemiş'}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">{record.description || "Ek bir not girilmemiş."}</p>
                                </div>
                            </div>
                        )) : <p className='text-sm text-muted-foreground'>Bu tarih aralığında not bulunmuyor.</p>}
                   </div>
                </CardContent>
            </Card>
        </div>
      )
    }

    if(selectedReportType === 'sinif' && classReportData){
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><PieChart/> Sınıf Geneli Durum Dağılımı</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                     <ChartContainer config={chartConfig} className="min-h-[300px] w-full max-w-lg">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={classReportData.dataByStatus}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                strokeWidth={5}
                            >
                            {classReportData.dataByStatus.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                            </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                </CardContent>
            </Card>
        )
    }

    return null;
  }
  
  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Raporlar</h1>
            <p className="text-muted-foreground">
              Sınıf ve öğrenci performansını analiz edin.
            </p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            PDF İndir
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class-select">Sınıf Seçimi</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger id="class-select">
                    <SelectValue placeholder="Sınıf seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-type">Rapor Türü</Label>
                <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Rapor türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bireysel">Bireysel Öğrenci Raporu</SelectItem>
                    <SelectItem value="sinif">Sınıf Raporu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2" style={{ display: selectedReportType === 'bireysel' ? 'block' : 'none' }}>
                <Label htmlFor="student-select">Öğrenci</Label>
                <Select value={selectedStudentId || ''} onValueChange={setSelectedStudentId} disabled={availableStudents.length === 0}>
                  <SelectTrigger id="student-select">
                    <SelectValue placeholder="Öğrenci seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudents.map(s => <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
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
        </Card>

        <div className="min-h-[400px]">
            {renderReportContent()}
        </div>
      </main>
    </AppLayout>
  );
}
