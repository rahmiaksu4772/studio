
'use client';

import * as React from 'react';
import { Calendar, Download, UserCircle } from 'lucide-react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RaporlarPage() {
  const [selectedClass, setSelectedClass] = React.useState('6a');
  const [selectedReportType, setSelectedReportType] = React.useState('bireysel');
  const [selectedStudent, setSelectedStudent] = React.useState<string | null>(null);

  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Raporlar</h1>
            <p className="text-muted-foreground">
              {selectedClass === '6a' ? '6/A' : '7/B'} sınıfı - Öğrenci ve sınıf performans raporları
            </p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            PDF İndir
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              <div className="space-y-1.5">
                <Label htmlFor="sinif-secimi">Sınıf Seçimi</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger id="sinif-secimi">
                    <SelectValue placeholder="Sınıf Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6a">6/A</SelectItem>
                    <SelectItem value="7b">7/B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rapor-turu">Rapor Türü</Label>
                <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                  <SelectTrigger id="rapor-turu">
                    <SelectValue placeholder="Rapor Türü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bireysel">Bireysel</SelectItem>
                    <SelectItem value="sinif">Sınıf</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ogrenci-secimi">Öğrenci</Label>
                <Select onValueChange={setSelectedStudent} disabled={selectedReportType !== 'bireysel'}>
                  <SelectTrigger id="ogrenci-secimi">
                    <SelectValue placeholder="Öğrenci" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="s1">Ahmet Yılmaz</SelectItem>
                    <SelectItem value="s2">Ayşe Kaya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="baslangic-tarihi">Başlangıç Tarihi</Label>
                <div className="relative">
                  <Input id="baslangic-tarihi" type="text" defaultValue="28.07.2025" className="pr-8" />
                  <Calendar className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bitis-tarihi">Bitiş Tarihi</Label>
                 <div className="relative">
                  <Input id="bitis-tarihi" type="text" defaultValue="03.08.2025" className="pr-8" />
                  <Calendar className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center flex flex-col items-center justify-center min-h-[400px]">
             <UserCircle className="w-16 h-16 text-muted-foreground/50 mb-4" />
             <h3 className="text-xl font-semibold">Öğrenci Seçin</h3>
             <p className="text-muted-foreground mt-1">Bireysel rapor görmek için bir öğrenci seçmelisiniz.</p>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
