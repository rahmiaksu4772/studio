
'use client';

import * as React from 'react';
import { Plus, Upload, Trash2, Pencil, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { classes as initialClasses, students as initialStudents } from '@/lib/mock-data';
import type { Student, ClassInfo } from '@/lib/types';
import { AddClassForm } from '@/components/add-class-form';
import { AddStudentForm } from '@/components/add-student-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function SiniflarimPage() {
  const [classes, setClasses] = React.useState<ClassInfo[]>(initialClasses);
  const [students, setStudents] = React.useState<Student[]>(initialStudents);
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);

  const handleAddClass = (className: string) => {
    const newClass: ClassInfo = {
      id: `c${classes.length + 1}`,
      name: className,
    };
    setClasses([newClass, ...classes]);
  };

  const handleAddStudent = (classId: string, studentData: Omit<Student, 'id' | 'classId'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `s${students.length + 1}`,
      classId,
    };
    setStudents([...students, newStudent]);
  };

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
            <p className="text-muted-foreground">Sınıflarınızı ve öğrencilerinizi buradan yönetin.</p>
          </div>
          <AddClassForm onAddClass={handleAddClass} />
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {classes.map((c) => (
            <Card key={c.id}>
              <CardHeader className="bg-muted/50">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{c.name}</CardTitle>
                    <CardDescription>Sınıf Seviyesi: {c.name.split('/')[0]}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-right text-primary font-bold">
                    <Users className="h-5 w-5" />
                    <span>{getStudentCount(c.id)} Öğrenci</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Öğrenci Listesi</h4>
                  <div className="flex items-center gap-2">
                    <AddStudentForm classId={c.id} onAddStudent={handleAddStudent} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          İçe Aktar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Özellik Geliştirme Aşamasında</AlertDialogTitle>
                          <AlertDialogDescription>
                            Öğrencileri toplu olarak içe aktarma özelliği yakında eklenecektir. Anlayışınız için teşekkür ederiz.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogAction>Tamam</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {getStudentCount(c.id) > 0 ? (
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    <ul className="divide-y">
                      {students
                        .filter(s => s.classId === c.id)
                        .sort((a, b) => a.studentNumber - b.studentNumber)
                        .map(student => (
                          <li key={student.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-primary w-8 text-center">{student.studentNumber}</span>
                              <span className="font-medium">{student.firstName} {student.lastName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => setEditingStudent(student)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleStudentDelete(student.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Users className="mx-auto h-10 w-10 mb-2" />
                    <h3 className="font-semibold">Öğrenci Bulunmuyor</h3>
                    <p className="text-sm">Bu sınıfa henüz öğrenci eklenmemiş.</p>
                    <div className="mt-4">
                        <AddStudentForm classId={c.id} onAddStudent={handleAddStudent} isFirstStudent={true}/>
                    </div>
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
