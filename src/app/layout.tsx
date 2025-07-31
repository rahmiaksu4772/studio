import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import { SidebarProvider } from '@/components/ui/sidebar';
import { PT_Sans } from "next/font/google"
import { TooltipProvider } from '@/components/ui/tooltip';

const fontSans = PT_Sans({
  subsets: ["latin"],
  weight: ['400', '700'],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: 'SınıfPlanım | Öğretmenin Dijital Asistanı',
  description: 'Öğretmenler için profesyonel dijital yoklama ve gözlem paneli.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <SidebarProvider>
            <TooltipProvider>
                {children}
            </TooltipProvider>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
