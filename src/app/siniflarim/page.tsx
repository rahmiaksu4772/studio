
'use client';

import * as React from 'react';
import {
  Plus,
  Upload,
  Trash2,
  Pencil,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { classes, students as allStudents } from '@/lib/mock-data';
import type { Student } from '@/lib/types';

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
            <h1 className="text-2xl font-semibold">Sınıflarım</h1>
            <p className="text-muted-foreground">
              Sınıflarınızı ve öğrencilerinizi buradan yönetin.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Sınıf
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {classes.map((c, index) => (
            <Card key={c.id}>
              <CardHeader className={cn("text-white rounded-t-lg", index % 2 === 0 ? 'bg-primary' : 'bg-secondary-foreground' )}>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className='text-primary-foreground'>{c.name}</CardTitle>
                        <p className="text-sm text-primary-foreground/80">Sınıf Seviyesi: {c.name.split('/')[0]}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">{getStudentCount(c.id)}</p>
                        <p className="text-sm text-primary-foreground/80">Öğrenci</p>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Öğrenciler</h4>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Öğrenci Ekle
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      İçe Aktar
                    </Button>
                  </div>
                </div>
                
                {getStudentCount(c.id) > 0 ? (
                  <ul className="space-y-2 max-h-96 overflow-y-auto">
                  {students.filter(s => s.classId === c.id).sort((a, b) => a.studentNumber - b.studentNumber).map(student => (
                    <li key={student.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground w-8 text-center">{student.studentNumber}</span>
                            <span>{student.firstName} {student.lastName}</span>
                        </div>
                        <div className="flex items-center">
                            <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleStudentDelete(student.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                    </li>
                  ))}
                </ul>
                ) : (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Users className="mx-auto h-8 w-8 mb-2" />
                        <h3 className="font-semibold">Öğrenci Bulunmuyor</h3>
                        <p className='text-sm'>Bu sınıfa henüz öğrenci eklenmemiş.</p>
                         <Button size="sm" className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            İlk Öğrenciyi Ekle
                        </Button>
                    </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </AppLayout>
  );
}
