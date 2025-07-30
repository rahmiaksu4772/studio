
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BookOpenCheck, Clock, Sandwich } from 'lucide-react';
import { addMinutes, format } from 'date-fns';

interface Ders {
  dersNo: number;
  baslangic: Date;
  bitis: Date;
}

export default function DersProgrami() {
  const [ilkDersSaati, setIlkDersSaati] = React.useState('08:30');
  const [teneffusSuresi, setTeneffusSuresi] = React.useState(10);
  const [dersSuresi] = React.useState(40);
  const [dersProgrami, setDersProgrami] = React.useState<Ders[]>([]);

  React.useEffect(() => {
    const hesaplaProgram = () => {
      const yeniProgram: Ders[] = [];
      if (!ilkDersSaati) return;

      const [saat, dakika] = ilkDersSaati.split(':').map(Number);
      let dersBaslangic = new Date();
      dersBaslangic.setHours(saat, dakika, 0, 0);

      for (let i = 1; i <= 8; i++) {
        const dersBitis = addMinutes(dersBaslangic, dersSuresi);
        yeniProgram.push({
          dersNo: i,
          baslangic: dersBaslangic,
          bitis: dersBitis,
        });
        dersBaslangic = addMinutes(dersBitis, teneffusSuresi);
      }
      setDersProgrami(yeniProgram);
    };

    hesaplaProgram();
  }, [ilkDersSaati, teneffusSuresi, dersSuresi]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpenCheck className="h-5 w-5" />
          Günlük Ders Programı
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <Label htmlFor="ilk-ders-saati" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              İlk Ders Saati
            </Label>
            <Input
              id="ilk-ders-saati"
              type="time"
              value={ilkDersSaati}
              onChange={(e) => setIlkDersSaati(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teneffus-suresi" className="flex items-center gap-2">
                <Sandwich className="h-4 w-4" />
                Teneffüs (dakika)
            </Label>
            <Input
              id="teneffus-suresi"
              type="number"
              value={teneffusSuresi}
              onChange={(e) => setTeneffusSuresi(parseInt(e.target.value, 10) || 0)}
              min="0"
            />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-3 bg-muted/50 font-semibold">
            <div className="p-3 text-center border-r">Ders</div>
            <div className="p-3 text-center border-r">Başlangıç</div>
            <div className="p-3 text-center">Bitiş</div>
          </div>
          {dersProgrami.map((ders, index) => (
            <div key={ders.dersNo}>
                <div className="grid grid-cols-3 items-center">
                    <div className="p-3 text-center border-r font-bold text-primary">{ders.dersNo}. Ders</div>
                    <div className="p-3 text-center border-r">{format(ders.baslangic, 'HH:mm')}</div>
                    <div className="p-3 text-center">{format(ders.bitis, 'HH:mm')}</div>
                </div>
                {index < dersProgrami.length - 1 && (
                    <div className="grid grid-cols-3 items-center bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        <div className="p-2 text-center border-r text-sm font-medium col-span-1">Teneffüs</div>
                        <div className="p-2 text-center border-r text-sm col-span-2">{teneffusSuresi} dakika</div>
                    </div>
                )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
