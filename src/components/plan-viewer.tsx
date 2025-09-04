
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { LessonPlanEntry } from '@/lib/types';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type PlanViewerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  entries: LessonPlanEntry[];
  startWeek?: number;
};

type PlanSection = 'objectiveExplanation' | 'methods' | 'assessment';

const sectionLabels: Record<PlanSection, string> = {
    objectiveExplanation: 'Açıklamalar',
    methods: 'Yöntem ve Teknikler',
    assessment: 'Ölçme ve Değerlendirme',
};

export function PlanViewer({ isOpen, onClose, title, entries, startWeek }: PlanViewerProps) {
    const [currentWeekIndex, setCurrentWeekIndex] = React.useState(0);
    const [activeSection, setActiveSection] = React.useState<PlanSection>('objectiveExplanation');

    React.useEffect(() => {
        if (isOpen && entries.length > 0) {
            const currentWeekNumber = startWeek || getWeek(new Date(), { weekStartsOn: 1 });
            const foundIndex = entries.findIndex(entry => {
                if (!entry.week) return false;
                const weekNumberMatch = entry.week.match(/\d+/);
                return weekNumberMatch ? parseInt(weekNumberMatch[0], 10) === currentWeekNumber : false;
            });
            setCurrentWeekIndex(foundIndex !== -1 ? foundIndex : 0);
            setActiveSection('objectiveExplanation'); // Reset to default section
        }
    }, [isOpen, entries, startWeek]);

    if (!isOpen || !entries.length) return null;

    const currentEntry = entries[currentWeekIndex];
    
    const renderContent = (content: string | number | undefined) => {
        if (!content || String(content).trim() === '') return <p className="text-sm text-muted-foreground">Bu alan için içerik bulunmuyor.</p>;
        return <p className='text-sm whitespace-pre-wrap leading-relaxed'>{String(content)}</p>;
    }

    const goToPreviousWeek = () => {
        setCurrentWeekIndex(prev => Math.max(0, prev - 1));
        setActiveSection('objectiveExplanation');
    };

    const goToNextWeek = () => {
        setCurrentWeekIndex(prev => Math.min(entries.length - 1, prev + 1));
        setActiveSection('objectiveExplanation');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-full h-full md:h-auto md:max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-4 md:p-6 border-b">
                    <DialogTitle className='text-xl md:text-2xl'>{title}</DialogTitle>
                </DialogHeader>
                
                <div className='flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-4 min-h-0'>
                   <div className="p-4 border-r bg-muted/50">
                     <h3 className="font-semibold mb-4 text-center text-lg">{currentEntry?.week?.replace(":", "") || "Hafta"}</h3>
                     <ul className="space-y-1">
                        {(['objectiveExplanation', 'methods', 'assessment'] as PlanSection[]).map(section => (
                             <li key={section}>
                                <button
                                    onClick={() => setActiveSection(section)}
                                    className={cn(
                                        "w-full text-left p-2 rounded-md text-sm transition-colors",
                                        activeSection === section
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    {sectionLabels[section]}
                                </button>
                            </li>
                        ))}
                     </ul>
                   </div>
                   <div className='md:col-span-3 p-6 overflow-y-auto space-y-4'>
                    {currentEntry ? (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle className='text-base'>Kazanım</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {renderContent(currentEntry.objective)}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className='text-base'>Konu</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {renderContent(currentEntry.topic)}
                                </CardContent>
                            </Card>
                             <Card className='min-h-[150px]'>
                                <CardHeader>
                                    <CardTitle className='text-base'>{sectionLabels[activeSection]}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {renderContent(currentEntry[activeSection])}
                                </CardContent>
                            </Card>
                             <div className='flex justify-between items-center text-xs text-muted-foreground pt-4'>
                                <span className='text-center flex-1'>Belirli Gün ve Haftalar: {currentEntry.specialDays || '-'}</span>
                                <span className='text-center flex-1'>Okul Dışı Öğrenme: {currentEntry.extracurricular || '-'}</span>
                            </div>
                        </>
                    ) : (
                        <p>Plan verisi yüklenemedi.</p>
                    )}
                   </div>
                </div>

                <DialogFooter className="p-4 border-t flex flex-row items-center justify-between w-full">
                    <Button variant="outline" onClick={goToPreviousWeek} disabled={currentWeekIndex === 0}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Önceki Hafta
                    </Button>
                     <p className='text-sm text-muted-foreground'>
                        {currentWeekIndex + 1} / {entries.length}
                     </p>
                    <Button variant="outline" onClick={goToNextWeek} disabled={currentWeekIndex === entries.length - 1}>
                        Sonraki Hafta <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
