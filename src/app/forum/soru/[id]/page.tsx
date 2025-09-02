
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
import { ChevronLeft, User, Calendar, ThumbsUp, Send, Loader2 } from 'lucide-react';
import type { ForumPost, ForumReply, ForumAuthor } from '@/lib/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useForumPost, addReply, toggleUpvote } from '@/hooks/use-forum';
import { useAuth } from '@/hooks/use-auth';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function PostDetailPageContent() {
  const params = useParams();
  const postId = params.id as string;
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid);
  const { post, replies, isLoading } = useForumPost(postId);
  const { toast } = useToast();
  
  const [replyContent, setReplyContent] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !user || !profile || !post) return;
    
    setIsSubmitting(true);
    const author: ForumAuthor = {
        uid: user.uid,
        name: profile.fullName,
        avatarUrl: profile.avatarUrl,
    };
    
    const success = await addReply(post.id, { author, content: replyContent });
    if (success) {
        setReplyContent('');
        toast({ title: 'Cevabınız gönderildi!' });
    } else {
        toast({ title: 'Hata', description: 'Cevabınız gönderilemedi.', variant: 'destructive' });
    }
    setIsSubmitting(false);
  }

  const handleUpvote = async (replyId: string) => {
    if (!user || !post) return;
    await toggleUpvote(post.id, replyId, user.uid);
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
                            <AvatarImage src={post.author.avatarUrl} data-ai-hint="teacher portrait" />
                            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{post.author.name}</span>
                    </div>
                     <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{format(new Date(post.date), 'dd MMMM yyyy, HH:mm', { locale: tr })}</span>
                </div>
            </CardHeader>
            <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed">{post.description}</p>
            </CardContent>
        </Card>

        <h3 className="text-2xl font-bold pt-4">{replies.length} Cevap</h3>
        <div className="space-y-4">
            {replies.sort((a,b) => b.upvotedBy.length - a.upvotedBy.length).map(reply => (
                <Card key={reply.id} className="bg-muted/50">
                    <CardContent className="p-4 flex gap-4">
                        <Avatar className='hidden sm:block mt-1'>
                            <AvatarImage src={reply.author.avatarUrl} data-ai-hint="teacher portrait" />
                            <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className='flex-1'>
                            <div className="flex items-center justify-between">
                                <p className="font-semibold">{reply.author.name}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(reply.date), 'dd.MM.yyyy HH:mm', { locale: tr })}</p>
                            </div>
                            <p className="text-sm mt-2">{reply.content}</p>
                            <div className='mt-3'>
                                <Button 
                                    variant={reply.upvotedBy.includes(user?.uid || '') ? "default" : "outline"} 
                                    size="sm" 
                                    className="flex items-center gap-2"
                                    onClick={() => handleUpvote(reply.id)}
                                    disabled={!user}
                                >
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{reply.upvotedBy.length}</span>
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
                    <Button type="submit" disabled={!replyContent.trim() || isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Cevabı Gönder
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
