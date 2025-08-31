
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import type { LessonPlanEntry } from '@/lib/types';
import { Button } from './ui/button';
import { X } from 'lucide-react';

type PlanViewerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  entries: LessonPlanEntry[];
};

export function PlanViewer({ isOpen, onClose, title, entries }: PlanViewerProps) {
    if (!isOpen) return null;

    const renderContent = (label: string, content: string | number | undefined) => {
        if (!content) return null;
        return (
            <div className='py-2'>
                <p className='text-sm font-semibold text-muted-foreground'>{label}</p>
                <p className='text-base'>{String(content)}</p>
            </div>
        )
    }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className='text-2xl'>{title}</DialogTitle>
          <DialogDescription>
            Aşağıda seçtiğiniz plana ait haftalık içerikleri görebilirsiniz.
          </DialogDescription>
        </DialogHeader>
        <div className='flex-1 overflow-y-auto pr-6 -mr-6'>
            <Accordion type="single" collapsible className="w-full">
                {entries.map((entry) => (
                    <AccordionItem value={entry.id} key={entry.id}>
                        <AccordionTrigger className='text-lg hover:no-underline'>
                            <div className='flex items-center gap-4 text-left'>
                               {entry.week && <Badge variant='secondary' className='text-base'>{entry.week.replace(":", "")}</Badge>}
                               <span>{entry.unit} - {entry.topic}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className='px-2'>
                            <div className='grid md:grid-cols-2 gap-x-8 gap-y-2'>
                                {renderContent('Kazanım', entry.objective)}
                                {renderContent('Kazanım Açıklaması', entry.objectiveExplanation)}
                                {renderContent('Yöntem ve Teknikler', entry.methods)}
                                {renderContent('Ölçme ve Değerlendirme', entry.assessment)}
                                {renderContent('Belirli Gün ve Haftalar', entry.specialDays)}
                                {renderContent('Okul Dışı Öğrenme', entry.extracurricular)}
                                {renderContent('Ders Saati', entry.hours)}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
        <DialogClose asChild className="absolute right-4 top-4">
            <Button variant="ghost" size="icon">
                <X className="h-6 w-6" />
            </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

