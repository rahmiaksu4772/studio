
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import { AuthProvider } from '@/hooks/use-auth.tsx';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Öğrenci Radarı | Öğretmenin Dijital Asistanı',
  description: 'Öğretmenler için profesyonel dijital yoklama ve gözlem paneli.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                {children}
                <Toaster />
            </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
