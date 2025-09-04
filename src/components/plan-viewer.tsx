
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type PlanViewerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  entries: LessonPlanEntry[];
  startWeek?: number;
};

export function PlanViewer({ isOpen, onClose, title, entries, startWeek }: PlanViewerProps) {
    const [currentWeekIndex, setCurrentWeekIndex] = React.useState(0);

    React.useEffect(() => {
        if (isOpen && entries.length > 0) {
            const currentWeekNumber = startWeek || getWeek(new Date(), { weekStartsOn: 1 });
            const foundIndex = entries.findIndex(entry => {
                if (!entry.week) return false;
                const weekNumberMatch = entry.week.match(/\d+/);
                return weekNumberMatch ? parseInt(weekNumberMatch[0], 10) === currentWeekNumber : false;
            });
            setCurrentWeekIndex(foundIndex !== -1 ? foundIndex : 0);
        }
    }, [isOpen, entries, startWeek]);

    if (!isOpen || !entries.length) return null;

    const currentEntry = entries[currentWeekIndex];
    
    const renderContent = (content: string | number | undefined) => {
        if (!content || String(content).trim() === '') return <p className="text-sm text-muted-foreground">Bu alan için içerik bulunmuyor.</p>;
        return <p className='text-sm whitespace-pre-wrap'>{String(content)}</p>;
    }

    const goToPreviousWeek = () => {
        setCurrentWeekIndex(prev => Math.max(0, prev - 1));
    };

    const goToNextWeek = () => {
        setCurrentWeekIndex(prev => Math.min(entries.length - 1, prev + 1));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl w-full h-full md:h-auto md:max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-4 md:p-6 border-b">
                    <DialogTitle className='text-xl md:text-2xl'>{title}</DialogTitle>
                </DialogHeader>
                
                <div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-4'>
                   {currentEntry && (
                     <div className='space-y-4'>
                        <div className="text-center">
                            {currentEntry.week && <Badge variant='default' className='text-base font-bold'>{currentEntry.week.replace(":", "")}</Badge>}
                        </div>
                        
                        <Tabs defaultValue="objective" className="w-full">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="objective">Kazanım</TabsTrigger>
                                <TabsTrigger value="topic">Konu</TabsTrigger>
                                <TabsTrigger value="objectiveExplanation">Açıklamalar</TabsTrigger>
                                <TabsTrigger value="methods">Yöntem-Teknik</TabsTrigger>
                                <TabsTrigger value="assessment">Ölçme-Değ.</TabsTrigger>
                            </TabsList>
                            <div className="p-4 border rounded-b-md min-h-[200px]">
                                <TabsContent value="objective">{renderContent(currentEntry.objective)}</TabsContent>
                                <TabsContent value="topic">{renderContent(currentEntry.topic)}</TabsContent>
                                <TabsContent value="objectiveExplanation">{renderContent(currentEntry.objectiveExplanation)}</TabsContent>
                                <TabsContent value="methods">{renderContent(currentEntry.methods)}</TabsContent>
                                <TabsContent value="assessment">{renderContent(currentEntry.assessment)}</TabsContent>
                            </div>
                        </Tabs>

                        <div className='flex justify-between items-center text-sm text-muted-foreground'>
                            <span>Belirli Gün ve Haftalar: {currentEntry.specialDays || '-'}</span>
                            <span>Okul Dışı Öğrenme: {currentEntry.extracurricular || '-'}</span>
                        </div>
                     </div>
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
