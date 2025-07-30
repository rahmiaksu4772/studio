
'use client';

import * as React from 'react';
import { Plus, Upload, Trash2, ArrowUp, ArrowDown, Pencil } from 'lucide-react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { classes, students as allStudents } from '@/lib/mock-data';
import type { Student, ClassInfo } from '@/lib/types';
import { cn } from '@/lib/utils';

const classColors = {
  '6b': 'bg-blue-500 text-white',
  '5a': 'bg-green-500 text-white',
  '8c': 'bg-purple-500 text-white',
};

export default function SiniflarimPage() {
  const [students, setStudents] = React.useState<Student[]>(allStudents);

  const handleStudentDelete = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };
  
  const getStudentCount = (classId: string) => {
    return students.filter(s => s.classId === classId).length;
  };

  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6">
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
      </main>
    </AppLayout>
  );
}
