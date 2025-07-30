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
    '½': 'bg-green-50/70 dark:bg-green-900/20 hover:bg-green-100/80 dark:hover:bg-green-900/30',
    '-': 'bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40',
    'Y': 'bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/40',
    'G': 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40',
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
             <Tooltip key={option.value}>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`${student.id}-${option.value}`} />
                    <Label htmlFor={`${student.id}-${option.value}`} className="cursor-pointer">
                      {option.icon ? <option.icon className={cn("h-5 w-5", option.color)} /> : option.value}
                    </Label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{option.label}</p>
                </TooltipContent>
              </Tooltip>
          ))}
        </RadioGroup>
      </TableCell>
      <TableCell>
        <div className="relative flex flex-col gap-2">
           <Textarea
            placeholder="Öğrenci hakkında bir not ekleyin..."
            value={description}
            onChange={handleDescriptionChange}
            className="min-h-[60px] bg-card/80 pr-28"
            rows={2}
          />
          <Button variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={isPending} className="absolute top-1 right-1 h-auto px-2 py-1 text-xs self-start gap-1">
              {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                  <Sparkles className="h-3 w-3 text-primary" />
              )}
              <span>AI Not</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
