'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { DailyRecord, Student, AttendanceStatus } from '@/lib/types';
import { statusOptions } from '@/lib/types';
import { cn } from '@/lib/utils';
import { generateDescriptionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

type StudentRowProps = {
  student: Student;
  record: DailyRecord;
  onRecordChange: (studentId: string, newRecord: Partial<DailyRecord>) => void;
  classId: string;
  recordDate: string;
};

export default function StudentRow({ student, record, onRecordChange, classId, recordDate }: StudentRowProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const status = record?.status ?? null;
  const description = record?.description ?? '';

  const handleStatusChange = (newStatus: string) => {
    onRecordChange(student.id, { status: newStatus as AttendanceStatus });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onRecordChange(student.id, { description: e.target.value });
  };
  
  const handleGenerateDescription = () => {
    startTransition(async () => {
        const result = await generateDescriptionAction({
            studentId: student.id,
            classId: classId,
            recordDate: recordDate,
        });

        if (result.error) {
            toast({
                title: 'Hata',
                description: result.error,
                variant: 'destructive',
            });
        } else if (result.description) {
            onRecordChange(student.id, { description: result.description });
            toast({
                title: 'Açıklama Oluşturuldu',
                description: 'AI açıklaması başarıyla eklendi.',
            });
        }
    });
  };

  const rowColorClass = {
    '+': 'bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/40',
    '-': 'bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40',
    'Y': 'bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/40',
    'A': 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40',
    'G': 'bg-gray-100 dark:bg-gray-800/30 hover:bg-gray-200 dark:hover:bg-gray-800/40',
  }[status!] || 'hover:bg-muted/50';

  return (
    <TableRow className={cn("transition-colors", rowColorClass)} data-status={status}>
      <TableCell className="font-medium">{student.studentNumber}</TableCell>
      <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
      <TableCell>
        <RadioGroup
          value={status || ''}
          onValueChange={handleStatusChange}
          className="flex flex-wrap items-center gap-x-4 gap-y-2"
        >
          {statusOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RadioGroupItem value={option.value} id={`${student.id}-${option.value}`} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{option.label}</p>
                </TooltipContent>
              </Tooltip>
              <Label htmlFor={`${student.id}-${option.value}`}>{option.value}</Label>
            </div>
          ))}
        </RadioGroup>
      </TableCell>
      <TableCell>
        {status && (
          <div className="flex flex-col gap-2">
             <Textarea
              placeholder="Öğrenci hakkında bir açıklama girin..."
              value={description}
              onChange={handleDescriptionChange}
              className="min-h-[60px] bg-card/80"
              rows={2}
            />
            <Button variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={isPending} className="self-start gap-2">
                {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="h-4 w-4 text-accent" />
                )}
                <span>AI ile Doldur</span>
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
