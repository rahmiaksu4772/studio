'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { Upload, Camera, Loader2, ScanLine, KeyRound, Check, X, Pencil, Trash2 } from 'lucide-react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { opticalScanAction } from '../actions';
import type { OpticalScanOutput } from '@/ai/schemas/optical-scan-schemas';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function OptikOkumaPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [imageData, setImageData] = React.useState<string | null>(null);
  const [scanResult, setScanResult] = React.useState<OpticalScanOutput | null>(null);
  const [answerKey, setAnswerKey] = React.useState<string[]>(Array(10).fill(''));
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageChange = (file: File | null) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: 'destructive',
        title: 'Dosya Boyutu Çok Büyük',
        description: `Lütfen 10MB'dan küçük bir resim dosyası seçin.`,
      });
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Geçersiz Dosya Türü',
        description: 'Lütfen .jpg, .png veya .webp formatında bir resim seçin.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setImageData(reader.result as string);
      setScanResult(null); // Clear previous results when a new image is uploaded
    };
    reader.readAsDataURL(file);
  };
  
  const handleAnswerKeyChange = (index: number, value: string) => {
    const newKey = [...answerKey];
    newKey[index] = value.toUpperCase();
    setAnswerKey(newKey);
  }
  
  const handleSetKeyLength = (length: number) => {
      const newLength = Math.max(1, length);
      setAnswerKey(currentKey => {
          if (newLength > currentKey.length) {
              return [...currentKey, ...Array(newLength - currentKey.length).fill('')];
          }
          return currentKey.slice(0, newLength);
      })
  }

  const handleScan = () => {
    if (!imageData) {
      toast({
        title: 'Resim Seçilmedi',
        description: 'Lütfen önce bir optik form resmi yükleyin.',
        variant: 'destructive',
      });
      return;
    }
    
    const filledAnswerKey = answerKey.filter(key => key.trim() !== '');
    if (filledAnswerKey.length !== answerKey.length) {
        toast({
            title: 'Eksik Cevap Anahtarı',
            description: 'Lütfen tüm sorular için cevap anahtarını doldurun.',
            variant: 'destructive',
        });
        return;
    }

    startTransition(async () => {
      const result = await opticalScanAction({
        imageDataUri: imageData,
        answerKey: answerKey,
      });

      if (result && !result.error) {
        setScanResult(result);
        toast({
          title: 'Okuma Başarılı!',
          description: `${result.results.length} öğrencinin cevabı başarıyla okundu.`,
        });
      } else {
        toast({
          title: 'Okuma Başarısız',
          description: result.error || 'Yapay zeka cevapları okurken bir sorunla karşılaştı.',
          variant: 'destructive',
        });
        setScanResult(null);
      }
    });
  };

  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Optik Okuma Sistemi</h1>
            <p className="text-muted-foreground">
              Yapay zeka ile optik formları otomatik olarak okuyun ve değerlendirin.
            </p>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 items-start">
            <Card>
                <CardHeader>
                    <CardTitle>1. Optik Formu Yükleyin</CardTitle>
                    <CardDescription>Okunacak formun resmini seçin veya kamerayla çekin.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 relative overflow-hidden">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Optik Form Önizleme" className="h-full w-full object-contain" />
                        ) : (
                            <div className="text-center text-muted-foreground">
                                <Upload className="mx-auto h-12 w-12" />
                                <p className="mt-2">Resim önizlemesi burada görünecek</p>
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                    />
                     <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                        id="camera-input"
                    />

                    <div className="flex gap-4">
                        <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" /> Dosya Seç
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => document.getElementById('camera-input')?.click()}>
                            <Camera className="mr-2 h-4 w-4" /> Kamerayı Aç
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>2. Cevap Anahtarını Girin</CardTitle>
                        <CardDescription>Sınavın doğru cevaplarını ve soru sayısını belirtin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mb-4">
                            <label htmlFor="question-count" className="text-sm font-medium">Soru Sayısı:</label>
                            <Input
                                id="question-count"
                                type="number"
                                value={answerKey.length}
                                onChange={(e) => handleSetKeyLength(parseInt(e.target.value, 10))}
                                className="w-24"
                                min="1"
                                max="50"
                            />
                        </div>
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                            {answerKey.map((key, index) => (
                                <div key={index} className="flex items-center gap-1">
                                    <span className="text-xs font-semibold w-6 shrink-0">{index + 1}.</span>
                                    <Input 
                                        value={key}
                                        onChange={(e) => handleAnswerKeyChange(index, e.target.value)}
                                        maxLength={1}
                                        className="h-8 text-center"
                                        placeholder="A"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                
                 <Button onClick={handleScan} disabled={isPending} className="w-full text-lg py-6">
                    {isPending ? (
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    ) : (
                      <ScanLine className="mr-2 h-6 w-6" />
                    )}
                    Cevapları Oku ve Değerlendir
                </Button>
            </div>
        </div>

        {scanResult && (
          <Card>
            <CardHeader>
              <CardTitle>Okuma Sonuçları</CardTitle>
              <CardDescription>
                Optik formdan okunan öğrenci cevapları ve değerlendirme sonuçları aşağıdadır.
              </CardDescription>
            </CardHeader>
            <CardContent>
                {scanResult.results.length > 0 ? (
                    <div className="border rounded-lg overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Öğrenci No</TableHead>
                                    <TableHead>Cevaplar</TableHead>
                                    <TableHead className='text-center text-green-600'>Doğru</TableHead>
                                    <TableHead className='text-center text-red-600'>Yanlış</TableHead>
                                    <TableHead className='text-center text-gray-500'>Boş</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scanResult.results.map((result) => (
                                    <TableRow key={result.studentNumber}>
                                        <TableCell className="font-bold">{result.studentNumber}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-x-3 gap-y-1">
                                                {result.answers.map((ans, i) => (
                                                    <div key={i} className="flex items-center gap-1 text-xs">
                                                        <span className='font-medium'>{i + 1}.</span>
                                                        <span className={answerKey[i] === ans ? 'text-green-600' : 'text-red-600'}>
                                                            {ans || '-'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-green-600">{result.correctCount}</TableCell>
                                        <TableCell className="text-center font-bold text-red-600">{result.incorrectCount}</TableCell>
                                        <TableCell className="text-center font-bold text-gray-500">{result.emptyCount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <Alert variant="destructive">
                        <AlertTitle>Öğrenci Bulunamadı</AlertTitle>
                        <AlertDescription>
                            Yapay zeka, yüklediğiniz resimden herhangi bir öğrenci cevabı okuyamadı. Lütfen daha net bir fotoğraf deneyin veya formun doğru formatta olduğundan emin olun.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
          </Card>
        )}
      </main>
    </AppLayout>
  );
}
