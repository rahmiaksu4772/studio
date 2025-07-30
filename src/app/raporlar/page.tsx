
'use client';
import * as React from 'react';
import { Calendar, Download, UserCircle, ChevronDown } from 'lucide-react';
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
  const [selectedReportType, setSelectedReportType] = React.useState('bireysel');

  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Raporlar</h1>
            <p className="text-muted-foreground">
              Sınıf ve öğrenci performansını analiz edin.
            </p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            PDF İndir
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class-select">Sınıf Seçimi</Label>
                <Select defaultValue="6a">
                  <SelectTrigger id="class-select">
                    <SelectValue placeholder="Sınıf seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="c1">6/A</SelectItem>
                    <SelectItem value="c2">7/B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-type">Rapor Türü</Label>
                <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Rapor türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bireysel">Bireysel Öğrenci Raporu</SelectItem>
                    <SelectItem value="sinif">Sınıf Raporu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2" style={{ display: selectedReportType === 'bireysel' ? 'block' : 'none' }}>
                <Label htmlFor="student-select">Öğrenci</Label>
                <Select>
                  <SelectTrigger id="student-select">
                    <SelectValue placeholder="Öğrenci seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="s1">Ahmet Yılmaz</SelectItem>
                    <SelectItem value="s2">Ayşe Kaya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date">Başlangıç Tarihi</Label>
                <div className="relative">
                  <Input id="start-date" type="text" placeholder="Tarih seçin" />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Bitiş Tarihi</Label>
                <div className="relative">
                  <Input id="end-date" type="text" placeholder="Tarih seçin" />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[400px] flex items-center justify-center border-dashed">
            <div className="text-center">
                <UserCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Raporu Görüntüleyin</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Lütfen yukarıdaki filtrelerden bir seçim yapın.
                </p>
            </div>
        </Card>
      </main>
    </AppLayout>
  );
}
