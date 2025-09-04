
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
import { Palette, Trash2, Plus, CheckSquare, ClipboardPaste } from 'lucide-react';
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


export function EditNoteDialog({ note, onUpdate, onClose, isOpen }: EditNoteDialogProps) {
  const { toast } = useToast();

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
  const watchItems = form.watch('items');

  React.useEffect(() => {
    if (note) {
      form.reset({
        title: note.title,
        content: note.content,
        color: note.color,
        type: note.type || 'text',
        items: note.items || []
      });
    }
  }, [note, form]);

  const handleSubmit = (values: EditNoteFormValues) => {
    // Clear content if it's a checklist, and items if it's text
    if (values.type === 'checklist') {
        values.content = '';
    } else {
        values.items = [];
    }
    
    if (values.type === 'text' && !values.title && !values.content) {
        toast({ title: "Boş Not", description: "Lütfen bir başlık veya içerik girin.", variant: "destructive" });
        return;
    }
    const isChecklistEmpty = !values.items || values.items.every(item => !item.text.trim());
    if (values.type === 'checklist' && !values.title && isChecklistEmpty) {
        toast({ title: "Boş Not", description: "Lütfen bir başlık veya en az bir liste öğesi girin.", variant: "destructive" });
        return;
    }

    onUpdate(note.id, values);
  };
  
  const handleItemChange = (id: string, newText: string) => {
    form.setValue('items', watchItems?.map(item => item.id === id ? { ...item, text: newText } : item), { shouldDirty: true });
  };
  
  const handleItemCheckedChange = (id: string, isChecked: boolean) => {
    form.setValue('items', watchItems?.map(item => item.id === id ? { ...item, isChecked } : item), { shouldDirty: true });
  };

  const handleAddNewItem = () => {
    form.setValue('items', [...(watchItems || []), { id: Date.now().toString(), text: '', isChecked: false }], { shouldDirty: true });
  };
  
  const handleRemoveItem = (id: string) => {
      form.setValue('items', watchItems?.filter(item => item.id !== id), { shouldDirty: true });
  }

  const handlePasteList = async () => {
    try {
        const text = await navigator.clipboard.readText();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const newItems: NoteChecklistItem[] = lines.map(line => ({
            id: Date.now().toString() + Math.random(),
            text: line,
            isChecked: false
        }));
        
        form.setValue('items', [...(watchItems || []).filter(i => i.text.trim() !== ''), ...newItems], { shouldDirty: true });

    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        toast({ title: "Hata", description: "Pano içeriği okunamadı.", variant: "destructive" });
    }
  };

  const isDarkColor = watchColor && (watchColor.includes('800') || watchColor.includes('900') || watchColor.includes('700'));


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
                    {(watchItems || []).map(item => (
                        <div key={item.id} className="flex items-center gap-2 group">
                            <Checkbox 
                                id={`item-edit-${item.id}`} 
                                checked={item.isChecked}
                                onCheckedChange={(checked) => handleItemCheckedChange(item.id, !!checked)}
                                className={cn(isDarkColor && 'border-white/50')}
                            />
                            <Input 
                                value={item.text} 
                                onChange={(e) => handleItemChange(item.id, e.target.value)}
                                className={cn(
                                    "flex-1 border-0 shadow-none focus-visible:ring-0 bg-transparent px-1",
                                    item.isChecked && "line-through text-muted-foreground",
                                     isDarkColor ? 'text-white placeholder:text-white/60' : 'text-black placeholder:text-zinc-500',
                                    isDarkColor && item.isChecked && 'text-white/50'
                                )}
                                placeholder='Liste öğesi'
                            />
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(item.id)}
                                className={cn(
                                    "h-7 w-7 rounded-full opacity-0 group-hover:opacity-100",
                                    isDarkColor ? "text-white/70 hover:text-white hover:bg-white/20" : "text-muted-foreground hover:text-destructive"
                                )}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <div className='flex items-center gap-2 border-t pt-2'>
                        <Button type="button" variant="ghost" onClick={handleAddNewItem} className={cn('w-full justify-start', isDarkColor ? 'text-white/70 hover:text-white' : 'text-zinc-500')}>
                            <Plus className='mr-2 h-4 w-4'/> Öğe Ekle
                        </Button>
                        <Button type="button" variant="ghost" onClick={handlePasteList} className={cn('w-full justify-start', isDarkColor ? 'text-white/70 hover:text-white' : 'text-zinc-500')}>
                            <ClipboardPaste className='mr-2 h-4 w-4'/> Yapıştır
                        </Button>
                    </div>
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
