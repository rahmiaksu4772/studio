
'use client';

import * as React from 'react';
import AppLayout from '@/components/app-layout';
import { Plus, Trash2, StickyNote, Loader2, Mic, MicOff, Camera, X as CloseIcon } from 'lucide-react';
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

const noteColors = [
  'bg-yellow-50 border-yellow-200',
  'bg-blue-50 border-blue-200',
  'bg-green-50 border-green-200',
  'bg-pink-50 border-pink-200',
  'bg-purple-50 border-purple-200',
];

function NotlarimPageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { notes, isLoading, addNote, deleteNote } = useNotes(user?.uid);
  
  const [newNoteTitle, setNewNoteTitle] = React.useState('');
  const [newNoteContent, setNewNoteContent] = React.useState('');
  const [newNoteImage, setNewNoteImage] = React.useState<string | null>(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  
  const recognitionRef = React.useRef<any>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
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
    if (newNoteContent.trim() === '' && !newNoteImage) {
      toast({
        title: 'Boş Not',
        description: 'Lütfen not içeriği girin veya bir fotoğraf ekleyin.',
        variant: 'destructive',
      });
      return;
    }
    
    if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
    }

    const newNoteData: Omit<Note, 'id'> = {
      title: newNoteTitle,
      content: newNoteContent,
      imageUrl: newNoteImage,
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
      date: new Date().toISOString() // Store as ISO string for proper ordering in Firestore
    };
    
    await addNote(newNoteData);

    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteImage(null);
  };

  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
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
      toast({
        title: 'Desteklenmiyor',
        description: 'Tarayıcınız sesle yazmayı desteklemiyor.',
        variant: 'destructive',
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
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
      if(recognitionRef.current) {
        toast({ title: 'Kayıt durduruldu.' });
      }
      recognitionRef.current = null;
    };

    recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
            toast({
                title: 'Mikrofon İzni Gerekli',
                description: 'Sesle not almak için mikrofon izni vermelisiniz.',
                variant: 'destructive',
            });
        } else {
             toast({
                title: 'Bir hata oluştu',
                description: `Ses tanıma hatası: ${event.error}`,
                variant: 'destructive',
            });
        }
      setIsRecording(false);
    };

    let final_transcript = newNoteContent;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim_transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript + '. ';
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      setNewNoteContent(final_transcript + interim_transcript);
    };
    
    recognition.start();
  };
  
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
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Notlarım</h2>
        </div>

        <Card className="max-w-xl mx-auto">
          <form onSubmit={handleAddNote}>
            <CardContent className="p-4 space-y-2">
              {newNoteImage && (
                <div className="relative">
                    <img src={newNoteImage} alt="Eklenen resim" className="rounded-md w-full" />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => setNewNoteImage(null)}
                    >
                        <CloseIcon className="h-4 w-4" />
                    </Button>
                </div>
              )}
              <Input
                placeholder="Not başlığı (isteğe bağlı)..."
                className="text-lg font-semibold border-0 focus-visible:ring-0 shadow-none px-2"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
              />
              <div className="relative">
                <Textarea
                    placeholder="Bir not alın ya da konuşarak yazdırın..."
                    className="border-0 focus-visible:ring-0 shadow-none p-2 pr-20"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={3}
                />
                <div className="absolute right-2 top-2 flex flex-col gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleToggleRecording}
                                    className={cn(isRecording && "text-red-500 animate-pulse")}
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
                                >
                                    <Camera />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Fotoğraf Ekle</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end p-4">
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Not Ekle
              </Button>
            </CardFooter>
          </form>
        </Card>

        {notes.length > 0 ? (
          <div
            className="grid gap-4 mt-8"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            }}
          >
            {notes.map((note) => (
              <Card
                key={note.id}
                className={cn('flex flex-col break-inside-avoid border', note.color)}
              >
                {note.imageUrl && <img src={note.imageUrl} alt="Not resmi" className="rounded-t-lg w-full object-cover" />}
                <CardHeader>
                  <CardTitle>{note.title || 'Başlıksız Not'}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow whitespace-pre-wrap">
                  {note.content}
                </CardContent>
                <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-4">
                  <span>{format(new Date(note.date), 'dd.MM.yyyy')}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
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
                        <AlertDialogAction onClick={() => handleDeleteNote(note.id)} className="bg-destructive hover:bg-destructive/90">
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 border-2 border-dashed rounded-lg mt-8">
            <StickyNote className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Henüz notunuz yok</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Yukarıdaki alandan ilk notunuzu ekleyerek başlayın.
            </p>
          </div>
        )}
      </main>
      
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent>
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
            <div className="bg-black rounded-md overflow-hidden">
              {capturedImage ? (
                <img src={capturedImage} alt="Yakalanan Görüntü"/>
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
