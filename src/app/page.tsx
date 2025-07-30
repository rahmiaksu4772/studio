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
  Award,
  GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';

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
  const [records, setRecords] = React.useState<Record<string, EvaluationType | null>>({'s4': 'artı', 's5': 'eksi'});
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
      <main className="flex-1 p-4 sm:p-6 space-y-12">
        {/* Günlük Takip Content */}
        <section id="gunluk-takip">
            <Card>
                <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableHead className="w-[80px]">No</TableHead>
                          <TableHead>Ad Soyad</TableHead>
                          {evaluationTypes.map(type => (
                            <TableHead key={type.id} className="text-center">
                               <type.icon className={cn("h-5 w-5 mx-auto", type.color)} />
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classStudents.map(student => (
                          <TableRow key={student.id} className="h-14">
                            <TableCell>
                              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-sm font-medium text-muted-foreground">
                                {student.studentNumber}
                              </div>
                            </TableCell>
                            <TableCell>
                                <span className="font-medium">{student.firstName} {student.lastName}</span>
                            </TableCell>
                            <RadioGroup
                                value={records[student.id] || ''}
                                onValueChange={(value) => handleRecordChange(student.id, value)}
                                className="contents"
                              >
                                {evaluationTypes.map(type => (
                                   <TableCell key={type.id} className="text-center">
                                      <RadioGroupItem value={type.id} id={`${student.id}-${type.id}`} className={cn(
                                          "h-6 w-6",
                                          records[student.id] === type.id && {
                                              'artı': "bg-green-500 border-green-500 text-white",
                                              'eksi': "bg-red-500 border-red-500 text-white",
                                              'yarım': "bg-yellow-500 border-yellow-500 text-white",
                                              'gelmedi': "bg-gray-500 border-gray-500 text-white",
                                          }[type.id]
                                      )} />
                                   </TableCell>
                                ))}
                              </RadioGroup>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="p-4 flex-col items-start gap-4">
                    <div className="w-full">
                        <Label htmlFor="description" className="mb-2 block">Açıklama <span className="text-red-500">*</span></Label>
                        <Textarea id="description" placeholder="Öğrenci hakkında bir not ekleyin..." defaultValue="ÇOK İYİ" />
                    </div>
                    <div className="flex items-center justify-end w-full gap-2">
                        <Button variant="outline">Temizle</Button>
                        <Button>
                            <FileText className="mr-2 h-4 w-4" />
                            Kaydet
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </section>
      </main>
    </AppLayout>
  );
}
