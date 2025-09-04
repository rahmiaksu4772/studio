
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { LessonPlanEntry } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PlanViewerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  entries: LessonPlanEntry[];
  startWeek?: number;
};

type ViewMode = 'objectiveExplanation' | 'methods' | 'assessment';

export function PlanViewer({ isOpen, onClose, title, entries, startWeek = 1 }: PlanViewerProps) {
    const [currentWeekIndex, setCurrentWeekIndex] = React.useState(startWeek - 1);
    const [viewMode, setViewMode] = React.useState<ViewMode>('objectiveExplanation');
    
    React.useEffect(() => {
        if(isOpen) {
            setCurrentWeekIndex(Math.max(0, startWeek - 1));
            setViewMode('objectiveExplanation');
        }
    }, [isOpen, startWeek]);

    if (!isOpen || !entries.length) return null;
    
    const currentEntry = entries[currentWeekIndex] || entries[0];
    
    const menuItems: { id: ViewMode, label: string, value: string | undefined | null }[] = [
        { id: 'objectiveExplanation', label: 'Açıklamalar', value: currentEntry.objectiveExplanation },
        { id: 'methods', label: 'Yöntem ve Teknikler', value: currentEntry.methods },
        { id: 'assessment', label: 'Ölçme ve Değerlendirme', value: currentEntry.assessment },
    ];

    const handleNextWeek = () => {
        setCurrentWeekIndex(prev => Math.min(prev + 1, entries.length - 1));
    };

    const handlePrevWeek = () => {
        setCurrentWeekIndex(prev => Math.max(0, prev - 1));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-full h-full md:h-auto md:max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-4 md:p-6 border-b">
                    <DialogTitle className='text-xl md:text-xl'>{title}</DialogTitle>
                    <CardDescription>{currentEntry.unit}</CardDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-4 flex-1 overflow-hidden">
                    {/* Sol Menü */}
                    <div className="col-span-1 border-r bg-muted/30 overflow-y-auto p-4 space-y-2">
                         <h3 className="font-semibold px-2">Detaylar</h3>
                        {menuItems.map((item) => (
                            <Button 
                                key={item.id}
                                variant={viewMode === item.id ? 'secondary' : 'ghost'}
                                className="w-full justify-start"
                                onClick={() => setViewMode(item.id)}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </div>

                    {/* Sağ İçerik Alanı */}
                    <div className="col-span-3 flex flex-col overflow-hidden">
                       <div className='p-6 flex-1 overflow-y-auto space-y-6'>
                            <Card>
                                <CardHeader>
                                    <CardTitle className='text-lg'>Kazanım</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{currentEntry.objective}</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className='text-lg'>Konu (Alt Öğrenme Alanı)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{currentEntry.topic}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className='text-lg'>{menuItems.find(m => m.id === viewMode)?.label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-wrap">{menuItems.find(m => m.id === viewMode)?.value || 'İçerik bulunmuyor.'}</p>
                                </CardContent>
                            </Card>
                       </div>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t flex flex-row items-center justify-between w-full">
                    <div className='flex items-center gap-4'>
                        <Button variant="outline" onClick={handlePrevWeek} disabled={currentWeekIndex === 0}>
                            <ChevronLeft className="mr-2 h-4 w-4" /> Önceki Hafta
                        </Button>
                        <span className="font-semibold text-sm tabular-nums">
                            {currentEntry.week || `${currentWeekIndex + 1}. Hafta`}
                        </span>
                        <Button variant="outline" onClick={handleNextWeek} disabled={currentWeekIndex === entries.length - 1}>
                           Sonraki Hafta <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                    <Button variant="secondary" onClick={onClose}>
                        Kapat
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
