
'use client';

import * as React from 'react';
import AppLayout from '@/components/app-layout';
import { Card, CardContent } from '@/components/ui/card';
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
import { students, classes } from '@/lib/mock-data';
import type { Student, DailyRecord, AttendanceStatus } from '@/lib/types';
import { Check, X, CheckSquare, CircleSlash } from 'lucide-react';

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
  { id: 'gelmedi', label: 'Gelmedi', icon: CircleSlash, color: 'text-gray-500', badgeClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
];

export default function GunlukTakipPage() {
  const [selectedClass, setSelectedClass] = React.useState(classes[0]);
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
  const classStudents = students.filter(s => s.classId === selectedClass.id);

  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {selectedClass.name} - Öğrenci Değerlendirme
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
      </main>
    </AppLayout>
  );
}
