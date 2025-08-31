
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { LessonPlanEntry } from '@/lib/types';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getWeek } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type PlanViewerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  entries: LessonPlanEntry[];
};

export function PlanViewer({ isOpen, onClose, title, entries }: PlanViewerProps) {
    const [currentWeekIndex, setCurrentWeekIndex] = React.useState(0);

    React.useEffect(() => {
        if (isOpen && entries.length > 0) {
            const currentWeekNumber = getWeek(new Date(), { weekStartsOn: 1 });
            const foundIndex = entries.findIndex(entry => {
                if (!entry.week) return false;
                const weekNumberMatch = entry.week.match(/\d+/);
                return weekNumberMatch ? parseInt(weekNumberMatch[0], 10) === currentWeekNumber : false;
            });
            setCurrentWeekIndex(foundIndex !== -1 ? foundIndex : 0);
        }
    }, [isOpen, entries]);

    if (!isOpen || !entries.length) return null;

    const currentEntry = entries[currentWeekIndex];

    const renderContent = (label: string, content: string | number | undefined) => {
        if (!content || String(content).trim() === '') return null;
        return (
            <div className='py-2'>
                <p className='text-sm font-semibold text-muted-foreground'>{label}</p>
                <p className='text-base'>{String(content)}</p>
            </div>
        )
    }

    const goToPreviousWeek = () => {
        setCurrentWeekIndex(prev => Math.max(0, prev - 1));
    };

    const goToNextWeek = () => {
        setCurrentWeekIndex(prev => Math.min(entries.length - 1, prev + 1));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-full h-full md:h-auto md:max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-4 md:p-6 border-b">
                    <DialogTitle className='text-xl md:text-2xl'>{title}</DialogTitle>
                    <DialogDescription>
                        Aşağıda seçtiğiniz plana ait haftalık içerikleri görebilirsiniz.
                    </DialogDescription>
                </DialogHeader>
                
                <div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-6'>
                   {currentEntry && (
                     <Card>
                        <CardHeader className='flex-col md:flex-row items-start md:items-center justify-between gap-2'>
                            <div className='space-y-1.5'>
                                {currentEntry.week && <Badge variant='secondary' className='text-base'>{currentEntry.week.replace(":", "")}</Badge>}
                                <CardTitle className='text-lg md:text-xl'>{currentEntry.unit} - {currentEntry.topic}</CardTitle>
                            </div>
                            {currentEntry.hours && <div className='text-left md:text-right flex-shrink-0'>
                                <p className='font-bold text-lg'>{currentEntry.hours}</p>
                                <p className='text-sm text-muted-foreground'>Ders Saati</p>
                            </div>}
                        </CardHeader>
                        <CardContent className='grid md:grid-cols-2 gap-x-8 gap-y-2 md:gap-y-4 pt-4'>
                            {renderContent('Kazanım', currentEntry.objective)}
                            {renderContent('Kazanım Açıklaması', currentEntry.objectiveExplanation)}
                            {renderContent('Yöntem ve Teknikler', currentEntry.methods)}
                            {renderContent('Ölçme ve Değerlendirme', currentEntry.assessment)}
                            {renderContent('Belirli Gün ve Haftalar', currentEntry.specialDays)}
                            {renderContent('Okul Dışı Öğrenme', currentEntry.extracurricular)}
                        </CardContent>
                     </Card>
                   )}
                </div>

                <DialogFooter className="p-4 border-t flex flex-col sm:flex-row items-center justify-between w-full gap-2">
                    <Button className='w-full sm:w-auto' variant="outline" onClick={goToPreviousWeek} disabled={currentWeekIndex === 0}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Önceki Hafta
                    </Button>
                     <p className='text-sm text-muted-foreground order-first sm:order-none'>
                        {currentWeekIndex + 1} / {entries.length}
                     </p>
                    <Button className='w-full sm:w-auto' variant="outline" onClick={goToNextWeek} disabled={currentWeekIndex === entries.length - 1}>
                        Sonraki Hafta <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
