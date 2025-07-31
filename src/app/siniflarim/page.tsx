
'use client';

import * as React from 'react';
import { Plus, Trash2, Pencil, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import type { Student, ClassInfo } from '@/lib/types';
import { AddClassForm } from '@/components/add-class-form';
import { AddStudentForm } from '@/components/add-student-form';
import { EditStudentForm } from '@/components/edit-student-form';
import { ImportStudentsDialog } from '@/components/import-students-dialog';
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
import { useToast } from '@/hooks/use-toast';
import { useClassesAndStudents } from '@/hooks/use-classes-and-students';

type ClassWithStudents = ClassInfo & {
    students: Student[];
};

export default function SiniflarimPage() {
  const { toast } = useToast();
  const { classes, addClass, addStudent, addMultipleStudents, updateStudent, deleteStudent, isLoading } = useClassesAndStudents();
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);

  const sortedClasses = React.useMemo(() => {
    return classes.map(c => ({
      ...c,
      students: [...c.students].sort((a, b) => a.studentNumber - b.studentNumber)
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [classes]);

  const handleAddClass = (className: string) => {
    try {
        addClass(className);
         toast({
          title: 'Başarılı!',
          description: `"${className}" sınıfı eklendi.`,
        });
    } catch (error: any) {
         toast({ title: 'Hata', description: error.message, variant: 'destructive'});
    }
  };

  const handleAddStudent = (classId: string, studentData: Omit<Student, 'id' | 'classId'>) => {
    try {
        addStudent(classId, studentData);
         toast({
          title: 'Başarılı!',
          description: `Öğrenci "${studentData.firstName} ${studentData.lastName}" eklendi.`,
        });
    } catch (error: any) {
         toast({ title: 'Hata', description: error.message, variant: 'destructive'});
    }
  };
  
  const handleBulkAddStudents = (classId: string, newStudents: Omit<Student, 'id' | 'classId'>[]) => {
    try {
        addMultipleStudents(classId, newStudents);
        toast({
            title: "Öğrenciler Başarıyla Aktarıldı!",
            description: `${newStudents.length} öğrenci "${classes.find(c=>c.id === classId)?.name}" sınıfına eklendi.`
        })
    } catch (error: any) {
        toast({ title: 'Hata', description: error.message, variant: 'destructive'});
    }
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    try {
        updateStudent(updatedStudent.classId, updatedStudent);
        toast({
          title: 'Başarılı!',
          description: `Öğrenci "${updatedStudent.firstName} ${updatedStudent.lastName}" güncellendi.`,
        });
        setEditingStudent(null);
    } catch (error: any) {
        toast({ title: 'Hata', description: error.message, variant: 'destructive'});
    }
  };

  const handleStudentDelete = (classId: string, studentId: string) => {
    try {
        deleteStudent(classId, studentId);
        toast({
          title: 'Öğrenci Silindi',
          description: 'Öğrenci başarıyla listeden kaldırıldı.',
          variant: 'destructive'
        });
    } catch (error: any) {
         toast({ title: 'Hata', description: error.message, variant: 'destructive'});
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <main className="flex-1 p-4 sm:p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </AppLayout>
    );
  }

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
          {sortedClasses.map((c) => (
            <Card key={c.id}>
              <CardHeader className="bg-muted/50">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{c.name}</CardTitle>
                    <CardDescription>Sınıf Seviyesi: {c.name.split('/')[0]}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-right text-primary font-bold">
                    <Users className="h-5 w-5" />
                    <span>{c.students.length} Öğrenci</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Öğrenci Listesi</h4>
                  <div className="flex items-center gap-2">
                    <AddStudentForm classId={c.id} onAddStudent={handleAddStudent} existingStudents={c.students} />
                    <ImportStudentsDialog classId={c.id} onImport={handleBulkAddStudents} existingStudents={c.students} />
                  </div>
                </div>

                {c.students.length > 0 ? (
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    <ul className="divide-y">
                      {c.students.map(student => (
                          <li key={student.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-primary w-8 text-center">{student.studentNumber}</span>
                              <span className="font-medium">{student.firstName} {student.lastName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => setEditingStudent(student)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Bu işlem geri alınamaz. "{student.firstName} ${student.lastName}" adlı öğrenciyi kalıcı olarak silecektir.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>İptal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleStudentDelete(c.id, student.id)} className='bg-destructive hover:bg-destructive/90'>
                                            Sil
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <AddStudentForm classId={c.id} onAddStudent={handleAddStudent} isFirstStudent={true} existingStudents={[]} />
                        <ImportStudentsDialog classId={c.id} onImport={handleBulkAddStudents} isFirstImport={true} existingStudents={[]} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        {editingStudent && (
          <EditStudentForm
            student={editingStudent}
            onUpdateStudent={handleUpdateStudent}
            onClose={() => setEditingStudent(null)}
            isOpen={!!editingStudent}
            existingStudents={classes.find(c => c.id === editingStudent.classId)?.students || []}
          />
        )}
      </main>
    </AppLayout>
  );
}
