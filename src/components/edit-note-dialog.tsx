
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Note, NoteChecklistItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Palette, Trash2, Plus, CheckSquare } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Checkbox } from './ui/checkbox';

const noteColors = [
  'bg-card',
  'bg-red-100/50 dark:bg-red-900/20 border-red-200/50 dark:border-red-900/30',
  'bg-yellow-100/50 dark:bg-yellow-900/20 border-yellow-200/50 dark:border-yellow-900/30',
  'bg-green-100/50 dark:bg-green-900/20 border-green-200/50 dark:border-green-900/30',
  'bg-blue-100/50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-900/30',
  'bg-purple-100/50 dark:bg-purple-900/20 border-purple-200/50 dark:border-purple-900/30',
  'bg-pink-100/50 dark:bg-pink-900/20 border-pink-200/50 dark:border-pink-900/30',
  'bg-gray-800 dark:bg-gray-700 border-gray-700 dark:border-gray-600',
  'bg-red-900 dark:bg-red-800 border-red-800 dark:border-red-700',
  'bg-green-900 dark:bg-green-800 border-green-800 dark:border-green-700',
  'bg-blue-900 dark:bg-blue-800 border-blue-800 dark:border-blue-700',
  'bg-purple-900 dark:bg-purple-800 border-purple-800 dark:border-purple-700',
  'bg-yellow-900 dark:bg-yellow-800 border-yellow-800 dark:border-yellow-700',
];

const formSchema = z.object({
  title: z.string(),
  content: z.string().optional(),
  color: z.string(),
  type: z.enum(['text', 'checklist']),
  items: z.array(z.object({
      id: z.string(),
      text: z.string(),
      isChecked: z.boolean(),
  })).optional()
});

type EditNoteFormValues = z.infer<typeof formSchema>;

type EditNoteDialogProps = {
  note: Note;
  onUpdate: (noteId: string, data: Partial<Note>) => void;
  onClose: () => void;
  isOpen: boolean;
};

const itemsToString = (items: NoteChecklistItem[] = []) => {
    return items.map(item => item.text).join('\n');
}

const stringToItems = (text: string, existingItems: NoteChecklistItem[] = []): NoteChecklistItem[] => {
    const existingMap = new Map(existingItems.map(item => [item.text, item]));
    return text.split('\n').map((line, index) => {
        const existing = existingMap.get(line);
        return {
            id: existing?.id || `${Date.now()}-${index}`,
            text: line,
            isChecked: existing?.isChecked || false
        };
    });
}


export function EditNoteDialog({ note, onUpdate, onClose, isOpen }: EditNoteDialogProps) {
  const { toast } = useToast();
  const [checklistText, setChecklistText] = React.useState(itemsToString(note.items));

  const form = useForm<EditNoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: note.title,
      content: note.content,
      color: note.color,
      type: note.type,
      items: note.items || [],
    },
  });

  const watchColor = form.watch('color');
  const watchType = form.watch('type');

  React.useEffect(() => {
    if (note) {
      form.reset({
        title: note.title,
        content: note.content,
        color: note.color,
        type: note.type || 'text',
        items: note.items || []
      });
      setChecklistText(itemsToString(note.items));
    }
  }, [note, form]);

  const handleSubmit = (values: EditNoteFormValues) => {
    const finalValues = {
        ...values,
        items: watchType === 'checklist' ? stringToItems(checklistText, note.items) : []
    };
    
    // Clear content if it's a checklist, and items if it's text
    if (finalValues.type === 'checklist') {
        finalValues.content = '';
    } else {
        finalValues.items = [];
    }
    
    if (finalValues.type === 'text' && !finalValues.title && !finalValues.content) {
        toast({ title: "Boş Not", description: "Lütfen bir başlık veya içerik girin.", variant: "destructive" });
        return;
    }
    const isChecklistEmpty = !finalValues.items || finalValues.items.every(item => !item.text.trim());
    if (finalValues.type === 'checklist' && !finalValues.title && isChecklistEmpty) {
        toast({ title: "Boş Not", description: "Lütfen bir başlık veya en az bir liste öğesi girin.", variant: "destructive" });
        return;
    }

    onUpdate(note.id, finalValues);
  };
  
  const handleToggleItem = (textLine: string) => {
      const items = stringToItems(checklistText, note.items);
      const targetItem = items.find(item => item.text === textLine);
      if (!targetItem) return;

      targetItem.isChecked = !targetItem.isChecked;
      
      const updatedText = items.map(item => item.text).join('\n');
      setChecklistText(updatedText); // Update local state to re-render
      
      // Also update the form state for submission
      form.setValue('items', items, { shouldDirty: true });
  }

  const isDarkColor = watchColor && (
    watchColor.startsWith('bg-gray-800') || 
    watchColor.startsWith('bg-red-900') || 
    watchColor.startsWith('bg-green-900') || 
    watchColor.startsWith('bg-blue-900') || 
    watchColor.startsWith('bg-purple-900') || 
    watchColor.includes('dark:')
  );


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-xl p-0", watchColor)}>
        <DialogHeader className="sr-only">
            <DialogTitle>Notu Düzenle</DialogTitle>
            <DialogDescription>Notun başlığını, içeriğini ve rengini düzenleyin.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="p-6 space-y-4">
              <input
                {...form.register('title')}
                placeholder="Başlık"
                className={cn(
                    "w-full text-lg font-semibold border-0 shadow-none focus-visible:ring-0 bg-transparent",
                    isDarkColor 
                        ? "text-white placeholder:text-white/60"
                        : "text-black placeholder:text-zinc-500"
                )}
              />
              {watchType === 'text' ? (
                <Textarea
                    {...form.register('content')}
                    placeholder="Bir not alın..."
                    rows={8}
                    className={cn(
                        "w-full border-0 shadow-none focus-visible:ring-0 bg-transparent",
                        isDarkColor 
                            ? "text-white placeholder:text-white/60"
                            : "text-black placeholder:text-zinc-500"
                    )}
                />
              ) : (
                <div className='space-y-2'>
                   <Textarea
                        placeholder="Yapılacakları listeleyin..."
                        value={checklistText}
                        onChange={(e) => {
                            setChecklistText(e.target.value);
                            form.setValue('items', stringToItems(e.target.value, form.getValues('items')), { shouldDirty: true });
                        }}
                        rows={8}
                        className={cn(
                            "w-full border-0 shadow-none focus-visible:ring-0 bg-transparent",
                            isDarkColor 
                                ? "text-white placeholder:text-white/60"
                                : "text-black placeholder:text-zinc-500"
                        )}
                    />
                </div>
              )}
            </div>
            <DialogFooter className="p-4 pt-0 mt-4 flex justify-between items-center bg-transparent">
                <div className='flex items-center gap-1'>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => form.setValue('type', watchType === 'text' ? 'checklist' : 'text')}
                        className={cn(
                            watchType === 'checklist' && 'bg-primary/20 text-primary',
                            isDarkColor ? 'text-white/70 hover:text-white' : 'text-zinc-500'
                        )}
                    >
                        <CheckSquare />
                    </Button>
                   <Popover>
                      <PopoverTrigger asChild>
                          <Button type="button" variant="ghost" size="icon" className={cn(isDarkColor ? "text-white/70 hover:text-white" : "text-zinc-500")}>
                              <Palette />
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2">
                        <div className="grid grid-cols-7 gap-1">
                            {noteColors.map(color => (
                                <button key={color} type="button" onClick={() => form.setValue('color', color)} className={cn("h-8 w-8 rounded-full border", color)} />
                            ))}
                        </div>
                      </PopoverContent>
                   </Popover>
               </div>
               <div>
                  <Button type="button" variant="ghost" onClick={onClose} className={cn(isDarkColor ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-zinc-500 hover:text-zinc-700')}>
                    Kapat
                  </Button>
                  <Button type="submit">Değişiklikleri Kaydet</Button>
               </div>
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  );
}
