'use client';

import * as React from 'react';
import { Clock, Users, BookOpen, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/app-layout';

export default function ClassPlanPage() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6">
        <Card className="bg-primary text-primary-foreground border-0 shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Hoş Geldiniz, Ayşe Öğretmen! 👋</h1>
              <p className="text-primary-foreground/80 mt-1">30 Temmuz 2025, Çarşamba</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Bugün</p>
              <p className="text-4xl font-bold">4</p>
              <p className="text-sm">Ders</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Öğrenci</CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">5</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aktif Sınıf</CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">2</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Haftalık Katılım</CardTitle>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">95%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Günlük Kayıt</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Bugünkü Derslerim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Bugün için planlanmış dersleriniz burada görünecektir.</p>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
