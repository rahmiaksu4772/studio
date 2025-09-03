
'use client';

import * as React from 'react';
import AppLayout from '@/components/app-layout';
import { Plus, Trash2, StickyNote, Loader2, Mic, MicOff, Camera, X as CloseIcon, Pin, PinOff, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Note } from '@/lib/types';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import AuthGuard from '@/components/auth-guard';
import { useNotes } from '@/hooks/use-notes';
import { EditNoteDialog } from '@/components/edit-note-dialog';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';


const noteColors = [
  'bg-card',
  'bg-red-100/50 dark:bg-red-900/20 border-red-200/50 dark:border-red-900/30',
  'bg-yellow-100/50 dark:bg-yellow-900/20 border-yellow-200/50 dark:border-yellow-900/30',
  'bg-green-100/50 dark:bg-green-900/20 border-green-200/50 dark:border-green-900/30',
  'bg-blue-100/50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-900/30',
  'bg-purple-100/50 dark:bg-purple-900/20 border-purple-200/50 dark:border-purple-900/30',
  'bg-pink-100/50 dark:bg-pink-900/20 border-pink-200/50 dark:border-pink-900/30',
];

function NotlarimPageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { notes, isLoading, addNote, deleteNote, updateNote } = useNotes(user?.uid);
  
  const [newNoteTitle, setNewNoteTitle] = React.useState('');
  const [newNoteContent, setNewNoteContent] = React.useState('');
  const [newNoteImage, setNewNoteImage] = React.useState<string | null>(null);
  const [newNoteColor, setNewNoteColor] = React.useState(noteColors[0]);
  const [isRecording, setIsRecording] = React.useState(false);
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  
  const recognitionRef = React.useRef<any>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [editingNote, setEditingNote] = React.useState<Note | null>(null);
  
  React.useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };
    
    if (isCameraOpen) {
      getCameraPermission();
    } else {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }
  }, [isCameraOpen]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
    }
    
    if (newNoteTitle.trim() === '' && newNoteContent.trim() === '' && !newNoteImage) {
        toast({
            title: 'Boş Not',
            description: 'Lütfen bir başlık, içerik veya resim ekleyin.',
            variant: 'destructive',
        });
        return;
    }
    
    const newNoteData: Omit<Note, 'id'> = {
      title: newNoteTitle,
      content: newNoteContent,
      type: 'text',
      imageUrl: newNoteImage,
      color: newNoteColor,
      isPinned: false,
      date: new Date().toISOString(),
    };
    
    await addNote(newNoteData);

    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteImage(null);
    setNewNoteColor(noteColors[0]);
  };
  
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
    }
  };
  
  const handleUseImage = () => {
    if (capturedImage) {
        setNewNoteImage(capturedImage);
        setIsCameraOpen(false);
        setCapturedImage(null);
    }
  };

  const handleToggleRecording = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
          toast({ title: 'Desteklenmiyor', description: 'Tarayıcınız sesle yazmayı desteklemiyor.', variant: 'destructive' });
          return;
      }

      if (isRecording && recognitionRef.current) {
          recognitionRef.current.stop();
          return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'tr-TR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
          setIsRecording(true);
          toast({ title: 'Kayıt başladı...', description: 'Konuşmaya başlayabilirsiniz.' });
      };

      recognition.onend = () => {
          setIsRecording(false);
          recognitionRef.current = null;
          toast({ title: 'Kayıt durduruldu.' });
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          if (event.error === 'not-allowed') {
              toast({ title: 'Mikrofon İzni Gerekli', description: 'Sesle not almak için mikrofon izni vermelisiniz.', variant: 'destructive' });
          } else {
              toast({ title: 'Bir hata oluştu', description: `Ses tanıma hatası: ${event.error}`, variant: 'destructive' });
          }
          setIsRecording(false);
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                setNewNoteContent(prevContent => prevContent + event.results[i][0].transcript);
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
      };

      recognition.start();
  };

  const handleUpdateNote = (noteId: string, data: Partial<Note>) => {
    updateNote(noteId, data);
    setEditingNote(null);
  }

  const handleTogglePin = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    updateNote(note.id, { isPinned: !note.isPinned });
  }
  
   if (isLoading) {
    return (
      <AppLayout>
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        
        <Card className={cn("max-w-xl mx-auto shadow-lg transition-colors", newNoteColor)}>
          <form onSubmit={handleAddNote}>
            <CardContent className="p-2 space-y-2">
              {newNoteImage && (
                <div className="relative">
                    <img src={newNoteImage} alt="Eklenen resim" className="rounded-md w-full max-h-48 object-cover" />
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/30 hover:bg-black/50 text-white"
                        onClick={() => setNewNoteImage(null)}
                    >
                        <CloseIcon className="h-4 w-4" />
                    </Button>
                </div>
              )}
              <Input
                placeholder="Başlık"
                className="text-base font-semibold border-0 focus-visible:ring-0 shadow-none px-4 bg-transparent"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
              />
              <Textarea
                  placeholder="Bir not alın..."
                  className="border-0 focus-visible:ring-0 shadow-none p-4 pt-0 bg-transparent"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={newNoteImage || newNoteTitle ? 3 : 1}
              />
            </CardContent>
            <CardFooter className="flex justify-between items-center p-2">
              <div className='flex items-center gap-1'>
                    <TooltipProvider>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleToggleRecording}
                                  className={cn("text-muted-foreground", isRecording && "text-red-500 animate-pulse")}
                              >
                                  {isRecording ? <MicOff /> : <Mic />}
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                              <p>{isRecording ? 'Kaydı Durdur' : 'Sesle Not Al'}</p>
                          </TooltipContent>
                      </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setIsCameraOpen(true)}
                                  className="text-muted-foreground"
                              >
                                  <Camera />
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                              <p>Resim Ekle</p>
                          </TooltipContent>
                      </Tooltip>
                  </TooltipProvider>
                   <Popover>
                    <TooltipProvider>
                      <Tooltip>
                          <PopoverTrigger asChild>
                            <TooltipTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
                                    <Palette />
                                </Button>
                            </TooltipTrigger>
                          </PopoverTrigger>
                          <TooltipContent>
                              <p>Renk Değiştir</p>
                          </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                      <PopoverContent className="w-auto p-2">
                        <div className="flex gap-1">
                            {noteColors.map(color => (
                                <button key={color} type="button" onClick={() => setNewNoteColor(color)} className={cn("h-8 w-8 rounded-full border", color)} />
                            ))}
                        </div>
                      </PopoverContent>
                   </Popover>
              </div>
              <Button type="submit" variant="ghost">Ekle</Button>
            </CardFooter>
          </form>
        </Card>

        {notes.length > 0 ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 mt-8">
            {notes.map((note) => (
              <Card
                key={note.id}
                onClick={() => setEditingNote(note)}
                className={cn('flex flex-col break-inside-avoid min-w-0 group cursor-pointer transition-shadow hover:shadow-lg', note.color)}
              >
                <CardHeader className="p-0">
                   {note.imageUrl && <img src={note.imageUrl} alt="Not resmi" className="rounded-t-lg w-full object-cover max-h-60" />}
                </CardHeader>
                <CardContent className={cn("p-4 flex-grow whitespace-pre-wrap break-all", note.imageUrl && "pt-4")}>
                  {note.title && <h3 className='font-bold mb-2'>{note.title}</h3>}
                  <p className='text-sm'>{note.content}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-xs text-muted-foreground p-2">
                  <span className='pl-2'>{format(new Date(note.date), 'dd MMM')}</span>
                  <div className='flex items-center opacity-0 group-hover:opacity-100 transition-opacity'>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => handleTogglePin(e, note)}>
                                    {note.isPinned ? <PinOff className='h-4 w-4 text-primary'/> : <Pin className='h-4 w-4'/>}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{note.isPinned ? 'Sabitlemeyi Kaldır' : 'Başa Sabitle'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Notu silmek istediğinize emin misiniz?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bu işlem geri alınamaz. Not kalıcı olarak silinecektir.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteNote(note.id)} 
                              className="bg-destructive hover:bg-destructive/90">
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 border-2 border-dashed rounded-lg mt-8 max-w-xl mx-auto">
            <StickyNote className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Henüz notunuz yok</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Yukarıdaki alandan ilk notunuzu ekleyerek başlayın.
            </p>
          </div>
        )}
      </main>
      
      {editingNote && (
        <EditNoteDialog
            key={editingNote.id}
            note={editingNote}
            onUpdate={handleUpdateNote}
            onClose={() => setEditingNote(null)}
            isOpen={!!editingNote}
        />
      )}
      
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kameradan Fotoğraf Ekle</DialogTitle>
            <DialogDescription>
                Notunuza eklemek için bir fotoğraf çekin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {hasCameraPermission === false && (
                <Alert variant="destructive">
                  <AlertTitle>Kamera İzni Gerekli</AlertTitle>
                  <AlertDescription>
                    Bu özelliği kullanmak için lütfen kamera erişimine izin verin.
                  </AlertDescription>
                </Alert>
            )}
            <div className="bg-black rounded-md overflow-hidden aspect-video flex items-center justify-center">
              {capturedImage ? (
                <img src={capturedImage} alt="Yakalanan Görüntü" className="w-full h-auto"/>
              ) : (
                 <video ref={videoRef} className="w-full h-auto" autoPlay muted playsInline />
              )}
               <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>
          <DialogFooter>
            {capturedImage ? (
                <>
                    <Button variant="outline" onClick={() => setCapturedImage(null)}>Tekrar Çek</Button>
                    <Button onClick={handleUseImage}>Fotoğrafı Kullan</Button>
                </>
            ) : (
                <Button onClick={handleCapture} disabled={!hasCameraPermission}>Fotoğraf Çek</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export default function NotlarimPage() {
    return (
        <AuthGuard>
            <NotlarimPageContent />
        </AuthGuard>
    )
}
