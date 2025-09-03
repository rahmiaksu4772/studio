
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { Note } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Palette, Trash2, Plus } from 'lucide-react';
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
  const watchItems = form.watch('items');

  React.useEffect(() => {
    if (note) {
      form.reset({
        title: note.title,
        content: note.content,
        color: note.color,
        type: note.type,
        items: note.items || []
      });
    }
  }, [note, form]);

  const handleSubmit = (values: EditNoteFormValues) => {
    if (values.type === 'text' && !values.title && !values.content) {
        toast({ title: "Boş Not", description: "Lütfen bir başlık veya içerik girin.", variant: "destructive" });
        return;
    }
    if (values.type === 'checklist' && !values.title && values.items?.every(item => !item.text)) {
        toast({ title: "Boş Not", description: "Lütfen bir başlık veya en az bir liste öğesi girin.", variant: "destructive" });
        return;
    }

    onUpdate(note.id, values);
  };
  
  const handleAddItem = () => {
    const currentItems = form.getValues('items') || [];
    form.setValue('items', [...currentItems, { id: new Date().toISOString(), text: '', isChecked: false }]);
  }
  
  const handleRemoveItem = (index: number) => {
    const currentItems = form.getValues('items') || [];
    form.setValue('items', currentItems.filter((_, i) => i !== index));
  }

  const handleItemCheckChange = (index: number, checked: boolean) => {
    const currentItems = form.getValues('items') || [];
    const newItems = [...currentItems];
    newItems[index].isChecked = checked;
    form.setValue('items', newItems);
  };

  const isDarkColor = watchColor && (watchColor.includes('dark:') || watchColor.includes('bg-gray-800') || watchColor.includes('bg-red-900') || watchColor.includes('bg-green-900') || watchColor.includes('bg-blue-900') || watchColor.includes('bg-purple-900') || watchColor.includes('bg-yellow-900'));


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-xl p-0", watchColor)}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="p-6 space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormControl>
                        <Input 
                            placeholder="Başlık" 
                            {...field} 
                            className={cn(
                                "text-lg font-semibold border-0 shadow-none focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground",
                                isDarkColor && "text-primary-foreground placeholder:text-primary-foreground/60"
                            )}
                        />
                    </FormControl>
                )}
              />
              {note.type === 'text' ? (
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormControl>
                        <Textarea 
                            placeholder="Bir not alın..."
                            {...field}
                            rows={8} 
                            className={cn(
                                "border-0 shadow-none focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground",
                                isDarkColor && "text-primary-foreground placeholder:text-primary-foreground/60"
                            )}
                        />
                        </FormControl>
                    )}
                />
              ) : (
                <div className='space-y-2'>
                    {watchItems?.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-2 group">
                             <FormField
                                control={form.control}
                                name={`items.${index}.isChecked`}
                                render={({ field }) => (
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={(checked) => handleItemCheckChange(index, Boolean(checked))}
                                            className={cn(isDarkColor && "border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-background")}
                                        />
                                    </FormControl>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`items.${index}.text`}
                                render={({ field }) => (
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            className={cn(
                                                "bg-transparent border-0 shadow-none focus-visible:ring-0", 
                                                item.isChecked && "line-through text-muted-foreground",
                                                isDarkColor && "text-primary-foreground placeholder:text-primary-foreground/60",
                                                item.isChecked && isDarkColor && "text-primary-foreground/50"
                                            )}
                                        />
                                    </FormControl>
                                )}
                            />
                            <Button variant="ghost" size="icon" type="button" onClick={() => handleRemoveItem(index)} className={cn("h-8 w-8 opacity-0 group-hover:opacity-100", isDarkColor && "text-primary-foreground/70 hover:text-primary-foreground")}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    ))}
                    <Button variant="ghost" type="button" onClick={handleAddItem} className={cn("w-full justify-start text-muted-foreground", isDarkColor && "text-primary-foreground/70 hover:text-primary-foreground")}>
                        <Plus className="h-4 w-4 mr-2"/>
                        Madde Ekle
                    </Button>
                </div>
              )}
            </div>
            <DialogFooter className="p-4 pt-0 mt-4 flex justify-between items-center bg-transparent">
               <Popover>
                  <PopoverTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className={cn("text-muted-foreground", isDarkColor && "text-primary-foreground/70 hover:text-primary-foreground")}>
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
               <div>
                  <Button type="button" variant="ghost" onClick={onClose} className={cn(isDarkColor && 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10')}>
                    Kapat
                  </Button>
                  <Button type="submit">Değişiklikleri Kaydet</Button>
               </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
