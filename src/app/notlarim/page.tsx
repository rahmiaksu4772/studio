
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Note = {
  id: string;
  title: string;
  content: string;
  date: string;
  color: string;
  imageUrl?: string;
};

const noteColors = [
  'bg-yellow-100 border-yellow-200 dark:bg-yellow-900/40 dark:border-yellow-800/60',
  'bg-blue-100 border-blue-200 dark:bg-blue-900/40 dark:border-blue-800/60',
  'bg-green-100 border-green-200 dark:bg-green-900/40 dark:border-green-800/60',
  'bg-pink-100 border-pink-200 dark:bg-pink-900/40 dark:border-pink-800/60',
  'bg-purple-100 border-purple-200 dark:bg-purple-900/40 dark:border-purple-800/60',
];

export default function NotlarimPage() {
  const { toast } = useToast();
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [newNoteTitle, setNewNoteTitle] = React.useState('');
  const [newNoteContent, setNewNoteContent] = React.useState('');
  const [newNoteImage, setNewNoteImage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRecording, setIsRecording] = React.useState(false);
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  
  const recognitionRef = React.useRef<any>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  React.useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('my-notes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error("Failed to load notes from localStorage", error);
      toast({
          title: "Notlar Yüklenemedi",
          description: "Notlarınız yüklenirken bir sorun oluştu.",
          variant: "destructive"
      })
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    try {
        if(!isLoading) {
            localStorage.setItem('my-notes', JSON.stringify(notes));
        }
    } catch (error) {
        console.error("Failed to save notes to localStorage", error);
        toast({
            title: "Notlar Kaydedilemedi",
            description: "Notlarınız kaydedilirken bir sorun oluştu.",
            variant: "destructive"
        })
    }
  }, [notes, isLoading, toast]);
  
  React.useEffect(() => {
    if (isCameraOpen) {
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
          toast({
            variant: 'destructive',
            title: 'Kamera Erişimi Reddedildi',
            description: 'Lütfen tarayıcı ayarlarınızdan kamera izinlerini etkinleştirin.',
          });
        }
      };
      getCameraPermission();
    } else {
        // Stop camera stream when modal is closed
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }
  }, [isCameraOpen, toast]);

  const handleAddNote = (e: React.FormEvent) => {
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

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: newNoteTitle,
      content: newNoteContent,
      imageUrl: newNoteImage || undefined,
      date: new Date().toLocaleDateString('tr-TR'),
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
    };

    setNotes([newNote, ...notes]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteImage(null);
    toast({
      title: 'Not Eklendi!',
      description: 'Yeni notunuz başarıyla eklendi.',
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    toast({
        title: 'Not Silindi',
        description: 'Notunuz başarıyla silindi.',
        variant: 'destructive',
    })
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
        if (event.error === 'not-allowed' || event.error === 'permission-dismissed') {
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
          final_transcript += event.results[i][0].transcript + ' ';
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      setNewNoteContent(final_transcript + interim_transcript);
    };
    
    recognition.start();
  };

  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notlarım</h1>
            <p className="text-muted-foreground">
              Google Keep benzeri kişisel not alma alanınız.
            </p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto mb-8 shadow-lg">
          <form onSubmit={handleAddNote}>
            <CardContent className="p-4 space-y-3">
              {newNoteImage && (
                <div className="relative">
                    <img src={newNoteImage} alt="Eklenen resim" className="rounded-lg w-full" />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 rounded-full"
                        onClick={() => setNewNoteImage(null)}
                    >
                        <CloseIcon className="h-4 w-4" />
                    </Button>
                </div>
              )}
              <Input
                placeholder="Not başlığı (isteğe bağlı)..."
                className="text-lg font-semibold border-0 focus-visible:ring-0 shadow-none p-2"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
              />
              <div className="relative">
                <Textarea
                    placeholder="Bir not alın ya da konuşarak yazdırın..."
                    className="border-0 focus-visible:ring-0 shadow-none p-2 resize-none pr-24"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={3}
                />
                <div className="absolute right-2 bottom-2 flex gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleToggleRecording}
                                    className={cn(
                                        "h-8 w-8 rounded-full text-muted-foreground",
                                        isRecording && "text-red-500 animate-pulse"
                                    )}
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
                                    className="h-8 w-8 rounded-full text-muted-foreground"
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
            <CardFooter className="flex justify-end p-2 pr-4">
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Not Ekle
              </Button>
            </CardFooter>
          </form>
        </Card>

        {isLoading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : notes.length > 0 ? (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            }}
          >
            {notes.map((note) => (
              <Card
                key={note.id}
                className={cn('flex flex-col break-inside-avoid', note.color)}
              >
                {note.imageUrl && <img src={note.imageUrl} alt="Not resmi" className="rounded-t-lg w-full object-cover" />}
                <CardHeader>
                  <CardTitle className="text-lg">{note.title || 'Başlıksız Not'}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow whitespace-pre-wrap text-sm">
                  {note.content}
                </CardContent>
                <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-4">
                  <span>{note.date}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
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
          <div className="text-center p-12 border-2 border-dashed rounded-lg">
            <StickyNote className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Henüz notunuz yok</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Yukarıdaki alandan ilk notunuzu ekleyerek başlayın.
            </p>
          </div>
        )}
      </main>
      
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kameradan Fotoğraf Ekle</DialogTitle>
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
            <div className="bg-black rounded-lg overflow-hidden relative">
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
                <Button onClick={handleCapture} disabled={!hasCameraPermission}>
                    <Camera className="mr-2 h-4 w-4" />
                    Fotoğraf Çek
                </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
