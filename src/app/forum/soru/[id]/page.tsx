
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/app-layout';
import AuthGuard from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, User, Calendar, ThumbsUp, Send } from 'lucide-react';
import type { ForumPost, ForumReply } from '@/lib/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Mock data - replace with actual data fetching
const mockPosts: ForumPost[] = [
  {
    id: '1',
    title: '8. Sınıf Matematik Üslü Sayılar Konusunda Zorlanan Öğrenciler İçin Etkinlik Önerisi',
    description: 'Üslü sayılar konusunu daha eğlenceli ve anlaşılır hale getirmek için hangi materyalleri veya etkinlikleri kullanabilirim? Özellikle soyut düşünme becerisi henüz gelişmemiş öğrenciler için zor oluyor. Renkli kartlar, legolar veya dijital oyunlar gibi farklı yaklaşımları denedim ama kalıcı öğrenme sağlamakta zorlanıyorum. Sizin bu konudaki tecrübeleriniz nelerdir?',
    category: 'Matematik',
    author: 'Ayşe Yılmaz',
    date: new Date('2024-05-15T10:30:00Z').toISOString(),
    replies: [
        {
            id: 'r1',
            author: 'Ahmet Çelik',
            date: new Date('2024-05-15T12:45:00Z').toISOString(),
            content: 'Merhaba Ayşe Hanım, ben bu konuda "üslü sayı tombalası" etkinliğini kullanıyorum ve çok verim alıyorum. Her öğrenciye üzerinde farklı üslü ifadelerin sonuçları yazan bir tombala kartı veriyorum. Ben de üslü ifadeleri okuyorum, doğru sonucu kartında bulan öğrenci üzerini kapatıyor. Hem rekabetçi hem de eğlenceli oluyor.',
            upvotes: 12,
        },
        {
            id: 'r2',
            author: 'Zeynep Kaplan',
            date: new Date('2024-05-16T09:10:00Z').toISOString(),
            content: 'Khan Academy\'nin üslü sayılarla ilgili interaktif alıştırmaları harika. Öğrenciler kendi hızlarında ilerleyebiliyor ve anında geri bildirim alıyorlar. Ayrıca konuyu gerçek hayatla ilişkilendirmek de önemli. Mesela bakteri bölünmesi veya bilgisayar hafıza birimleri (kilobayt, megabayt) gibi örnekler verebilirsiniz.',
            upvotes: 8,
        }
    ],
  },
  // Add other posts if needed for routing tests
];


function PostDetailPageContent() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = React.useState<ForumPost | null>(null);
  const [replyContent, setReplyContent] = React.useState('');

  React.useEffect(() => {
    // In a real app, you would fetch this from Firestore
    const foundPost = mockPosts.find(p => p.id === postId);
    setPost(foundPost || null);
  }, [postId]);

  if (!post) {
    return (
        <AppLayout>
             <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div className="text-center py-12">
                    <p className='text-lg font-medium'>Soru bulunamadı.</p>
                    <Link href="/forum">
                        <Button variant="link" className="mt-2">Foruma geri dön</Button>
                    </Link>
                </div>
            </main>
        </AppLayout>
    );
  }

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(replyContent.trim()){
        // In a real app, you'd save the reply to Firestore
        console.log("New Reply:", replyContent);
        setReplyContent('');
        // You would also refresh the post data to show the new reply
    }
  }

  return (
    <AppLayout>
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
         <div>
            <Link href="/forum" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Tüm Sorulara Geri Dön
            </Link>
        </div>

        <Card>
            <CardHeader>
                <div className='flex items-center justify-between'>
                    <Badge variant="default">{post.category}</Badge>
                </div>
                <CardTitle className="text-2xl md:text-3xl mt-2">{post.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                    <div className="flex items-center gap-2">
                        <Avatar className='h-8 w-8'>
                            <AvatarImage src={`https://i.pravatar.cc/40?u=${post.author}`} data-ai-hint="teacher portrait" />
                            <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{post.author}</span>
                    </div>
                     <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{format(new Date(post.date), 'dd MMMM yyyy, HH:mm', { locale: tr })}</span>
                </div>
            </CardHeader>
            <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed">{post.description}</p>
            </CardContent>
        </Card>

        <h3 className="text-2xl font-bold pt-4">{post.replies.length} Cevap</h3>
        <div className="space-y-4">
            {post.replies.sort((a,b) => b.upvotes - a.upvotes).map(reply => (
                <Card key={reply.id} className="bg-muted/50">
                    <CardContent className="p-4 flex gap-4">
                        <Avatar className='hidden sm:block mt-1'>
                             <AvatarImage src={`https://i.pravatar.cc/40?u=${reply.author}`} data-ai-hint="teacher portrait" />
                            <AvatarFallback>{reply.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className='flex-1'>
                            <div className="flex items-center justify-between">
                                <p className="font-semibold">{reply.author}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(reply.date), 'dd.MM.yyyy HH:mm', { locale: tr })}</p>
                            </div>
                            <p className="text-sm mt-2">{reply.content}</p>
                            <div className='mt-3'>
                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{reply.upvotes}</span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Cevap Yaz</CardTitle>
            </CardHeader>
            <form onSubmit={handleReplySubmit}>
                <CardContent>
                    <Textarea 
                        placeholder="Değerli görüşlerinizi ve önerilerinizi buraya yazın..."
                        rows={5}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={!replyContent.trim()}>
                        <Send className="mr-2 h-4 w-4" /> Cevabı Gönder
                    </Button>
                </CardFooter>
            </form>
        </Card>

      </main>
    </AppLayout>
  );
}


export default function PostDetailPage() {
    return (
        <AuthGuard>
            <PostDetailPageContent />
        </AuthGuard>
    )
}
