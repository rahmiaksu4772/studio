
'use client';

import * as React from 'react';
import {
  Home,
  Users,
  BarChart,
  Calendar,
  FileText,
  Shield,
  Settings,
  Plus,
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  Pencil,
  Check,
  X,
  CheckSquare,
  CircleSlash as CircleSlashIcon, // Renamed to avoid conflict
  Download,
  UserCircle,
  Clock,
  BookOpen,
  TrendingUp,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { classes, students as allStudents } from '@/lib/mock-data';
import type { Student } from '@/lib/types';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Data and types from gunluk-takip
type EvaluationType = 'artı' | 'eksi' | 'yarım' | 'gelmedi';

const evaluationTypes: {
  id: EvaluationType;
  label: string;
  icon: React.ElementType;
  color: string;
  badgeClass: string;
}[] = [
  { id: 'artı', label: 'Artı', icon: Check, color: 'text-green-500', badgeClass: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { id: 'eksi', label: 'Eksi', icon: X, color: 'text-red-500', badgeClass: 'bg-red-100 text-red-700 hover:bg-red-200' },
  { id: 'yarım', label: 'Yarım', icon: CheckSquare, color: 'text-yellow-500', badgeClass: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
  { id: 'gelmedi', label: 'Gelmedi', icon: CircleSlashIcon, color: 'text-gray-500', badgeClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
];


export default function ClassPlanPage() {
    // State from siniflarim
  const [students, setStudents] = React.useState<Student[]>(allStudents);
  const handleStudentDelete = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };
  const getStudentCount = (classId: string) => {
    return students.filter(s => s.classId === classId).length;
  };

  // State from gunluk-takip
  const [selectedClassGunluk, setSelectedClassGunluk] = React.useState(classes[0]);
  const [records, setRecords] = React.useState<Record<string, EvaluationType | null>>({});
  const handleRecordChange = (studentId: string, value: string) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: value as EvaluationType,
    }));
  };
  const getCounts = () => {
    const counts: Record<EvaluationType, number> = {
      artı: 0,
      eksi: 0,
      yarım: 0,
      gelmedi: 0,
    };
    Object.values(records).forEach(status => {
      if (status) {
        counts[status]++;
      }
    });
    return counts;
  };
  const counts = getCounts();
  const classStudents = allStudents.filter(s => s.classId === selectedClassGunluk.id);

  // State from raporlar
  const [selectedClassRapor, setSelectedClassRapor] = React.useState('6a');
  const [selectedReportType, setSelectedReportType] = React.useState('bireysel');
  const [selectedStudent, setSelectedStudent] = React.useState<string | null>(null);


  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        {/* Ana Panel Content */}
        <Card className="bg-primary text-primary-foreground border-0 shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Hoş Geldiniz, Ayşe Öğretmen! 👋</h1>
              <p className="text-primary-foreground/80 mt-1">30 Temmuz 2025, Çarşamba</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Bugün</p>
              <p className="text-4xl font-bold">4</p>
              <p className="text-sm">Ders</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Öğrenci</CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">5</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aktif Sınıf</CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">2</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Haftalık Katılım</CardTitle>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">95%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Günlük Kayıt</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Sınıflarım Content */}
        <section id="siniflarim">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Sınıflarım</h1>
                <p className="text-muted-foreground">Sınıflarınızı ve öğrencilerinizi yönetin</p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Yeni Sınıf
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {classes.map((c, index) => (
                <Card key={c.id} className="flex flex-col">
                  <CardHeader className={cn("rounded-t-xl flex flex-row items-center justify-between p-4", index === 0 ? 'bg-primary text-primary-foreground' : 'bg-green-500 text-primary-foreground')}>
                    <div>
                      <h2 className="text-xl font-bold">{c.name}</h2>
                      <p className="text-sm opacity-80">Ortaokul {c.name.charAt(0)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">{getStudentCount(c.id)}</p>
                      <p className="text-sm opacity-80">Öğrenci</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 flex flex-col">
                     <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-sm">Öğrenci Listesi</h3>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Plus className="h-4 w-4" />
                                </Button>
                                 <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Upload className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                         <Separator />
                     </div>
                    <div className="px-4 pb-4 flex-1">
                      {getStudentCount(c.id) > 0 ? (
                        <ul className="space-y-1 text-sm">
                          {students.filter(s => s.classId === c.id).map(student => (
                            <li key={student.id} className="flex items-center justify-between group">
                              <span>{student.studentNumber} - {student.firstName} {student.lastName}</span>
                               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleStudentDelete(student.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                 </Button>
                                 <div className="flex flex-col">
                                    <ArrowUp className="h-3 w-3 cursor-pointer hover:text-primary" />
                                    <ArrowDown className="h-3 w-3 cursor-pointer hover:text-primary" />
                                 </div>
                               </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">Henüz öğrenci eklenmemiş</p>
                      )}
                    </div>
                    <Separator />
                    <div className="p-2 flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
        </section>
        
        {/* Günlük Takip Content */}
        <section id="gunluk-takip">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h1 className="text-2xl font-bold tracking-tight">
                {selectedClassGunluk.name} - Öğrenci Değerlendirme
              </h1>
              <p className="text-muted-foreground text-sm mt-1 sm:mt-0">
                30 Temmuz 2025
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              {evaluationTypes.map(type => (
                <Card key={type.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">{type.label}</p>
                      <span className={`text-2xl font-bold ${type.color}`}>
                        {counts[type.id]}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[250px] sm:w-[300px]">Ad Soyad</TableHead>
                      {evaluationTypes.map(type => (
                        <TableHead key={type.id} className="text-center">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="flex items-center gap-1.5">
                               <span className="font-semibold">{type.label}</span>
                               <type.icon className={`h-4 w-4 ${type.color}`} />
                            </div>
                            <Badge className={`cursor-pointer ${type.badgeClass}`}>
                              Tümü
                            </Badge>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classStudents.map(student => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center h-7 w-7 rounded-full bg-muted text-sm font-medium text-muted-foreground">
                              {student.studentNumber}
                            </span>
                            <span className="font-medium">{student.firstName} {student.lastName}</span>
                          </div>
                        </TableCell>
                         <RadioGroup
                            value={records[student.id] || ''}
                            onValueChange={(value) => handleRecordChange(student.id, value)}
                            className="contents"
                          >
                            {evaluationTypes.map(type => (
                               <TableCell key={type.id} className="text-center">
                                  <RadioGroupItem value={type.id} id={`${student.id}-${type.id}`} />
                               </TableCell>
                            ))}
                          </RadioGroup>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </Card>
        </section>

        {/* Raporlar Content */}
        <section id="raporlar">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Raporlar</h1>
                <p className="text-muted-foreground">
                  {selectedClassRapor === '6a' ? '6/A' : '7/B'} sınıfı - Öğrenci ve sınıf performans raporları
                </p>
              </div>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                PDF İndir
              </Button>
            </div>
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="sinif-secimi">Sınıf Seçimi</Label>
                    <Select value={selectedClassRapor} onValueChange={setSelectedClassRapor}>
                      <SelectTrigger id="sinif-secimi">
                        <SelectValue placeholder="Sınıf Seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6a">6/A</SelectItem>
                        <SelectItem value="7b">7/B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rapor-turu">Rapor Türü</Label>
                    <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                      <SelectTrigger id="rapor-turu">
                        <SelectValue placeholder="Rapor Türü" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bireysel">Bireysel</SelectItem>
                        <SelectItem value="sinif">Sınıf</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ogrenci-secimi">Öğrenci</Label>
                    <Select onValueChange={setSelectedStudent} disabled={selectedReportType !== 'bireysel'}>
                      <SelectTrigger id="ogrenci-secimi">
                        <SelectValue placeholder="Öğrenci" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="s1">Ahmet Yılmaz</SelectItem>
                        <SelectItem value="s2">Ayşe Kaya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="baslangic-tarihi">Başlangıç Tarihi</Label>
                    <div className="relative">
                      <Input id="baslangic-tarihi" type="text" defaultValue="28.07.2025" className="pr-8" />
                      <Calendar className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bitis-tarihi">Bitiş Tarihi</Label>
                     <div className="relative">
                      <Input id="bitis-tarihi" type="text" defaultValue="03.08.2025" className="pr-8" />
                      <Calendar className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center flex flex-col items-center justify-center min-h-[400px]">
                 <UserCircle className="w-16 h-16 text-muted-foreground/50 mb-4" />
                 <h3 className="text-xl font-semibold">Öğrenci Seçin</h3>
                 <p className="text-muted-foreground mt-1">Bireysel rapor görmek için bir öğrenci seçmelisiniz.</p>
              </CardContent>
            </Card>
        </section>

        {/* Planlarım Content */}
        <section id="planlarim">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Planlarım</h1>
                <p className="text-muted-foreground">
                  Yıllık ve haftalık planlarınızı yönetin
                </p>
              </div>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Plan Yükle
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    Tüm Planlar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground/80" />
                </div>
                <h3 className="text-xl font-semibold">Henüz plan yüklenmemiş</h3>
                <p className="text-muted-foreground mt-1">
                  İlk planınızı yükleyerek başlayın.
                </p>
                <Button className="mt-4">
                    <Upload className="mr-2 h-4 w-4" />
                    Plan Yükle
                </Button>
              </CardContent>
            </Card>
        </section>

        {/* Erişim Kodları, Admin, Ayarlar Content */}
        <section id="diger" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Erişim Kodları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Veli ve öğrenci erişim kodları yönetimi burada yer alacak.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5" />
                  Admin Panel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Okul yönetimi ve diğer admin özellikleri burada yer alacak.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  Hesabım ve Ayarlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Kullanıcı profili, tema seçimi ve diğer ayarlar burada yer alacak.
                </p>
              </CardContent>
            </Card>
        </section>
      </main>
    </AppLayout>
  );
}
