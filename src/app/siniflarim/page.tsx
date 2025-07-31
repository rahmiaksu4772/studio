
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
import { 
    getClasses, 
    getStudents, 
    addClass, 
    addStudent, 
    addMultipleStudents, 
    updateStudent,
    deleteStudent 
} from '@/services/firestore';

type ClassWithStudents = ClassInfo & {
    students: Student[];
};

export default function SiniflarimPage() {
  const { toast } = useToast();
  const [classes, setClasses] = React.useState<ClassWithStudents[]>([]);
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchAllData = React.useCallback(async () => {
    setIsLoading(true);
    try {
        const fetchedClasses = await getClasses();
        const classesWithStudents = await Promise.all(
            fetchedClasses.map(async (c) => {
                const students = await getStudents(c.id);
                return { ...c, students: students.sort((a,b) => a.studentNumber - b.studentNumber) };
            })
        );
        setClasses(classesWithStudents);
    } catch (error) {
        console.error("Error fetching data:", error);
        toast({
            title: "Veri Yükleme Hatası",
            description: "Sınıf ve öğrenciler yüklenirken bir hata oluştu.",
            variant: "destructive"
        })
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);


  const handleAddClass = async (className: string) => {
    try {
        const newClass = await addClass(className);
        setClasses(prev => [{ ...newClass, students: [] }, ...prev]);
        toast({
            title: 'Başarılı!',
            description: `"${className}" sınıfı eklendi.`,
        });
    } catch (error) {
        toast({ title: 'Hata', description: 'Sınıf eklenirken bir hata oluştu.', variant: 'destructive'});
    }
  };

  const handleAddStudent = async (classId: string, studentData: Omit<Student, 'id' | 'classId'>) => {
    try {
        const newStudent = await addStudent(classId, studentData);
        setClasses(prev => prev.map(c => 
            c.id === classId ? { ...c, students: [...c.students, newStudent].sort((a,b) => a.studentNumber - b.studentNumber) } : c
        ));
         toast({
          title: 'Başarılı!',
          description: `Öğrenci "${studentData.firstName} ${studentData.lastName}" eklendi.`,
        });
    } catch (error) {
         toast({ title: 'Hata', description: 'Öğrenci eklenirken bir hata oluştu.', variant: 'destructive'});
    }
  };
  
  const handleBulkAddStudents = async (classId: string, newStudents: Omit<Student, 'id' | 'classId'>[]) => {
    try {
        await addMultipleStudents(classId, newStudents);
        await fetchAllData(); // Re-fetch all data to get new students with their IDs
        toast({
            title: "Öğrenciler Başarıyla Aktarıldı!",
            description: `${newStudents.length} öğrenci "${classes.find(c=>c.id === classId)?.name}" sınıfına eklendi.`
        })
    } catch (error) {
        toast({ title: 'Hata', description: 'Öğrenciler aktarılırken bir hata oluştu.', variant: 'destructive'});
    }
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    try {
        await updateStudent(updatedStudent.classId, updatedStudent);
        setClasses(prev => prev.map(c =>
            c.id === updatedStudent.classId 
            ? { ...c, students: c.students.map(s => s.id === updatedStudent.id ? updatedStudent : s).sort((a,b) => a.studentNumber - b.studentNumber)} 
            : c
        ));
        toast({
          title: 'Başarılı!',
          description: `Öğrenci "${updatedStudent.firstName} ${updatedStudent.lastName}" güncellendi.`,
        });
        setEditingStudent(null);
    } catch (error) {
        toast({ title: 'Hata', description: 'Öğrenci güncellenirken bir hata oluştu.', variant: 'destructive'});
    }
  };

  const handleStudentDelete = async (classId: string, studentId: string) => {
    try {
        await deleteStudent(classId, studentId);
        setClasses(prev => prev.map(c => 
            c.id === classId ? { ...c, students: c.students.filter(s => s.id !== studentId) } : c
        ));
        toast({
          title: 'Öğrenci Silindi',
          description: 'Öğrenci başarıyla listeden kaldırıldı.',
          variant: 'destructive'
        });
    } catch (error) {
         toast({ title: 'Hata', description: 'Öğrenci silinirken bir hata oluştu.', variant: 'destructive'});
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
