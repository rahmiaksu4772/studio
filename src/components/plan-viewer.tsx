
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
import { ArrowLeft, ArrowRight, List } from 'lucide-react';
import { getWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"


type PlanViewerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  entries: LessonPlanEntry[];
  startWeek?: number;
};

type PlanSection = 'objective' | 'topic' | 'objectiveExplanation' | 'methods' | 'assessment';

const sectionLabels: Record<PlanSection, string> = {
    objective: 'Kazanım',
    topic: 'Konu',
    objectiveExplanation: 'Açıklamalar',
    methods: 'Yöntem ve Teknikler',
    assessment: 'Ölçme ve Değerlendirme',
};

export function PlanViewer({ isOpen, onClose, title, entries, startWeek }: PlanViewerProps) {
    const [currentWeekIndex, setCurrentWeekIndex] = React.useState(0);
    const [activeSection, setActiveSection] = React.useState<PlanSection>('objective');

    React.useEffect(() => {
        if (isOpen && entries.length > 0) {
            const currentWeekNumber = startWeek || getWeek(new Date(), { weekStartsOn: 1 });
            const foundIndex = entries.findIndex(entry => {
                if (!entry.week) return false;
                const weekNumberMatch = entry.week.match(/\d+/);
                return weekNumberMatch ? parseInt(weekNumberMatch[0], 10) === currentWeekNumber : false;
            });
            setCurrentWeekIndex(foundIndex !== -1 ? foundIndex : 0);
            setActiveSection('objective'); // Reset to default section
        }
    }, [isOpen, entries, startWeek]);
    
    React.useEffect(() => {
        if(activeSection === 'objectiveExplanation' || activeSection === 'methods' || activeSection === 'assessment') {
            // if dropdown menu item is selected, do nothing with tabs
        } else {
            // sync activeSection with tabs
        }
    }, [activeSection]);

    if (!isOpen || !entries.length) return null;

    const currentEntry = entries[currentWeekIndex];
    
    const renderContent = (content: string | number | undefined) => {
        if (!content || String(content).trim() === '') return <p className="text-sm text-muted-foreground p-4">Bu alan için içerik bulunmuyor.</p>;
        return <p className='text-sm whitespace-pre-wrap leading-relaxed p-4'>{String(content)}</p>;
    }

    const goToPreviousWeek = () => {
        setCurrentWeekIndex(prev => Math.max(0, prev - 1));
        setActiveSection('objective');
    };

    const goToNextWeek = () => {
        setCurrentWeekIndex(prev => Math.min(entries.length - 1, prev + 1));
        setActiveSection('objective');
    };

    const getActiveContent = () => {
        if (!currentEntry) return <p className="text-sm text-muted-foreground p-4">Plan verisi yüklenemedi.</p>;

        switch(activeSection) {
            case 'objective': return renderContent(currentEntry.objective);
            case 'topic': return renderContent(currentEntry.topic);
            case 'objectiveExplanation': return renderContent(currentEntry.objectiveExplanation);
            case 'methods': return renderContent(currentEntry.methods);
            case 'assessment': return renderContent(currentEntry.assessment);
            default: return renderContent(currentEntry.objective);
        }
    }
    
    const isMenuSelection = ['objectiveExplanation', 'methods', 'assessment'].includes(activeSection);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-full h-full md:h-auto md:max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-4 md:p-6 border-b">
                    <DialogTitle className='text-xl md:text-xl'>{title}</DialogTitle>
                     <p className="font-semibold text-primary text-base">{currentEntry?.week?.replace(":", "") || "Hafta"}</p>
                </DialogHeader>
                
                <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                   <div className="flex items-center justify-between">
                     <Tabs value={isMenuSelection ? 'menu-item' : activeSection} onValueChange={(value) => setActiveSection(value as PlanSection)} className="w-full">
                        <TabsList className='grid w-full grid-cols-2'>
                           <TabsTrigger value="objective">Kazanım</TabsTrigger>
                           <TabsTrigger value="topic">Konu</TabsTrigger>
                        </TabsList>
                        {isMenuSelection && (
                            <div className='mt-2 p-2 text-center bg-accent text-accent-foreground rounded-md text-sm font-semibold'>
                                {sectionLabels[activeSection]}
                            </div>
                        )}
                     </Tabs>
                     
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className='ml-2'>
                                <List className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {(['objectiveExplanation', 'methods', 'assessment'] as PlanSection[]).map(section => (
                                <DropdownMenuItem key={section} onSelect={() => setActiveSection(section)}>
                                    {sectionLabels[section]}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                   </div>
                   <div className='border rounded-lg min-h-[200px] bg-background'>
                    {getActiveContent()}
                   </div>

                   <div className='flex justify-between items-center text-xs text-muted-foreground pt-4 text-center'>
                        <p className='flex-1'>Belirli Gün ve Haftalar: <span className='font-medium'>{currentEntry.specialDays || '-'}</span></p>
                        <p className='flex-1'>Okul Dışı Öğrenme: <span className='font-medium'>{currentEntry.extracurricular || '-'}</span></p>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t flex flex-row items-center justify-between w-full">
                    <Button variant="outline" onClick={goToPreviousWeek} disabled={currentWeekIndex === 0}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Önceki
                    </Button>
                     <p className='text-sm text-muted-foreground'>
                        {currentWeekIndex + 1} / {entries.length}
                     </p>
                    <Button variant="outline" onClick={goToNextWeek} disabled={currentWeekIndex === entries.length - 1}>
                        Sonraki <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

