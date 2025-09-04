
'use client';

import * as React from 'react';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Student } from '@/lib/types';
import { Textarea } from './ui/textarea';

type StudentImportData = Omit<Student, 'id' | 'classId'>;
type ClassImportData = { className: string; students: StudentImportData[] };

type ImportClassesAndStudentsDialogProps = {
  onImport: (data: ClassImportData[]) => void;
};

export function ImportClassesAndStudentsDialog({ onImport }: ImportClassesAndStudentsDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [pastedText, setPastedText] = React.useState('');
  const [parsedData, setParsedData] = React.useState<ClassImportData[]>([]);

  const resetState = () => {
    setIsLoading(false);
    setPastedText('');
    setParsedData([]);
  };

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPastedText(text);

    if (text.trim() === '') {
        setParsedData([]);
        return;
    }

    const lines = text.split('\n').filter(line => line.trim() !== '');
    const data: ClassImportData[] = [];
    let currentClass: ClassImportData | null = null;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      const isStudent = /^\d/.test(trimmedLine);

      if (!isStudent) {
        // It's a class name
        currentClass = { className: trimmedLine, students: [] };
        data.push(currentClass);
      } else if (currentClass) {
        // It's a student line
        const parts = trimmedLine.split(/\s+/);
        if (parts.length >= 3) {
            const studentNumber = parseInt(parts[0], 10);
            const lastName = parts[parts.length - 1];
            const firstName = parts.slice(1, -1).join(' ');

            if (!isNaN(studentNumber) && firstName && lastName) {
                currentClass.students.push({ studentNumber, firstName, lastName });
            }
        }
      }
    });

    setParsedData(data);
  };

  const handleConfirmImport = async () => {
    if (parsedData.length === 0) {
      toast({
        title: 'Veri Yok',
        description: 'Lütfen geçerli bir sınıf ve öğrenci listesi yapıştırın.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    await onImport(parsedData);
    setIsLoading(false);
    setOpen(false);
  };
  
  React.useEffect(() => {
    if (!open) {
      setTimeout(resetState, 300);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Toplu Sınıf/Öğrenci Aktar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sınıfları ve Öğrencileri Toplu Aktar</DialogTitle>
          <DialogDescription>
            E-Okul'dan veya başka bir kaynaktan kopyaladığınız tüm listeyi aşağıya yapıştırın.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Her sınıfın adını bir satıra, ardından o sınıftaki öğrencileri alt alta satırlara yapıştırın. Format: 'Okul Numarası Adı Soyadı'
          </p>
          <Textarea 
            placeholder={'8/A\n123 Ali Yılmaz\n456 Ayşe Kaya\n8/B\n789 Mehmet Demir'}
            rows={10}
            value={pastedText}
            onChange={handlePasteChange}
          />
        </div>

        {parsedData.length > 0 && (
          <div className='space-y-2'>
            <h4 className='font-medium text-sm'>Aktarım Özeti</h4>
            <div className="border rounded-md max-h-32 overflow-y-auto p-2 text-xs bg-background">
                <p>Toplam <span className='font-bold'>{parsedData.length}</span> sınıf ve <span className='font-bold'>{parsedData.reduce((acc, c) => acc + c.students.length, 0)}</span> öğrenci aktarılacak.</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            İptal
          </Button>
          <Button onClick={handleConfirmImport} disabled={isLoading || parsedData.length === 0}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Aktarımı Onayla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
