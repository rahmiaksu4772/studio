
'use client';

import * as React from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileDown, FileText, Loader2, CheckCircle, AlertTriangle, Users } from 'lucide-react';
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

type StudentImportData = Omit<Student, 'id' | 'classId'>;

type ImportStudentsDialogProps = {
  classId: string;
  onImport: (classId: string, students: StudentImportData[]) => void;
  isFirstImport?: boolean;
};

export function ImportStudentsDialog({ onImport, classId, isFirstImport = false }: ImportStudentsDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [importedStudents, setImportedStudents] = React.useState<StudentImportData[]>([]);

  const resetState = () => {
    setIsLoading(false);
    setFileName(null);
    setImportedStudents([]);
  };

  const handleDownloadTemplate = () => {
    const templateData = [['Okul Numarası', 'Adı', 'Soyadı']];
    const ws = XLSX.utils.aoa_to_ws(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ogrenci Listesi');
    XLSX.writeFile(wb, 'ogrenci_sablonu.xlsx');
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);
    setImportedStudents([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, {
        header: ['studentNumber', 'firstName', 'lastName'],
        range: 1, // Skip header row
      }) as any[];
      
      const validStudents = json.filter(row => 
          row.studentNumber && row.firstName && row.lastName &&
          typeof row.studentNumber === 'number' &&
          typeof row.firstName === 'string' &&
          typeof row.lastName === 'string'
      ).map(row => ({
          studentNumber: row.studentNumber,
          firstName: row.firstName,
          lastName: row.lastName,
      }));

      setImportedStudents(validStudents);
      
      if(validStudents.length === 0 && json.length > 0){
          toast({
              title: 'Dosya Hatası',
              description: 'Dosyadaki veriler şablonla uyumlu değil veya boş. Lütfen şablonu kontrol edin.',
              variant: 'destructive',
          });
      }

    } catch (error) {
      console.error('Error parsing file:', error);
      toast({
        title: 'Hata!',
        description: 'Dosya okunurken bir hata oluştu. Lütfen dosyanın bozuk olmadığından emin olun.',
        variant: 'destructive',
      });
      resetState();
    } finally {
      setIsLoading(false);
       // Reset file input to allow re-uploading the same file
      event.target.value = '';
    }
  };

  const handleConfirmImport = () => {
    if(importedStudents.length === 0) {
         toast({
            title: 'Aktarılacak Öğrenci Yok',
            description: 'Lütfen geçerli öğrenci verileri içeren bir dosya seçin.',
            variant: 'destructive',
        });
        return;
    }
    onImport(classId, importedStudents);
    setOpen(false);
  };
  
  React.useEffect(() => {
    if (!open) {
      setTimeout(resetState, 300);
    }
  }, [open]);

  const triggerButton = isFirstImport ? (
     <Button variant="outline" size="sm">
      <Upload className="h-4 w-4 mr-2" />
      Toplu Aktar
    </Button>
  ) : (
    <Button variant="outline" size="sm">
      <Upload className="h-4 w-4 mr-2" />
      İçe Aktar
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Öğrencileri İçe Aktar</DialogTitle>
          <DialogDescription>
            Öğrencileri Excel veya CSV dosyası kullanarak toplu halde ekleyin. Lütfen sağlanan şablonu kullanın.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Button variant="outline" onClick={handleDownloadTemplate} className="w-full">
            <FileDown className="mr-2 h-4 w-4" />
            Örnek Şablonu İndir (.xlsx)
          </Button>

          <div className="relative">
            <Button asChild variant="outline" className="w-full">
              <label htmlFor="file-upload" className="cursor-pointer">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                <span>Dosya Seç</span>
              </label>
            </Button>
            <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx, .xls, .csv" />
          </div>

          {fileName && (
            <div className="p-3 rounded-md bg-muted text-sm flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                  <FileText className="h-5 w-5 flex-shrink-0" />
                  <span className='truncate'>{fileName}</span>
              </div>
               { !isLoading && importedStudents.length > 0 && <CheckCircle className='h-5 w-5 text-green-500' /> }
               { !isLoading && importedStudents.length === 0 && <AlertTriangle className='h-5 w-5 text-yellow-500' /> }
            </div>
          )}

          {importedStudents.length > 0 && (
            <div className='space-y-2'>
                <h4 className='font-medium flex items-center gap-2'><Users className='h-4 w-4'/>Aktarılacak Öğrenciler ({importedStudents.length})</h4>
                <div className="border rounded-md max-h-40 overflow-y-auto p-2 text-sm bg-background">
                    <ul className='divide-y'>
                        {importedStudents.map((s, i) => (
                           <li key={i} className='p-1.5 flex justify-between'>
                               <span>{s.firstName} {s.lastName}</span>
                               <span className='text-muted-foreground'>No: {s.studentNumber}</span>
                           </li>
                        ))}
                    </ul>
                </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            İptal
          </Button>
          <Button onClick={handleConfirmImport} disabled={isLoading || importedStudents.length === 0}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            {importedStudents.length > 0 ? `${importedStudents.length} Öğrenciyi Aktar` : 'Onayla'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
