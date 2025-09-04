
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

type PlanViewerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  entries: LessonPlanEntry[];
  startWeek?: number;
};

export function PlanViewer({ isOpen, onClose, title, entries }: PlanViewerProps) {
    if (!isOpen || !entries.length) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-full h-full md:h-auto md:max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-4 md:p-6 border-b">
                    <DialogTitle className='text-xl md:text-xl'>{title}</DialogTitle>
                </DialogHeader>
                
                <div className='flex-1 overflow-y-auto'>
                   <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[8%]'>AY</TableHead>
                                <TableHead className='w-[10%]'>HAFTA</TableHead>
                                <TableHead className='w-[8%]'>SAAT</TableHead>
                                <TableHead className='w-[15%]'>ÖĞRENME ALANI</TableHead>
                                <TableHead className='w-[20%]'>KAZANIM</TableHead>
                                <TableHead className='w-[24%]'>AÇIKLAMALAR</TableHead>
                                <TableHead className='w-[15%]'>ALT ÖĞRENME ALANI</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell>{entry.month}</TableCell>
                                    <TableCell>{entry.week}</TableCell>
                                    <TableCell>{entry.hours} SAAT</TableCell>
                                    <TableCell>{entry.unit}</TableCell>
                                    <TableCell>{entry.objective}</TableCell>
                                    <TableCell>{entry.objectiveExplanation}</TableCell>
                                    <TableCell>{entry.topic}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                   </Table>
                </div>

                <DialogFooter className="p-4 border-t flex flex-row items-center justify-end w-full">
                    <Button variant="outline" onClick={onClose}>
                        Kapat
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
