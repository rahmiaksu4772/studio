
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
import { ChevronLeft, User, Calendar, ThumbsUp, Send, Loader2, MessageSquare } from 'lucide-react';
import type { ForumPost, ForumReply, ForumAuthor, ForumComment } from '@/lib/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useForumPost, addReply, toggleUpvote, addCommentToReply } from '@/hooks/use-forum';
import { useAuth } from '@/hooks/use-auth';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';

function ReplyCard({ reply, comments, user, post, profile }: { reply: ForumReply, comments: ForumComment[], user: any, post: ForumPost, profile: any }) {
    const { toast } = useToast();
    const [commentContent, setCommentContent] = React.useState('');
    const [isSubmittingComment, setIsSubmittingComment] = React.useState(false);

    const handleUpvote = async (replyId: string) => {
        if (!user || !post) return;
        await toggleUpvote(post.id, replyId, user.uid);
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim() || !user || !profile || !post) return;

        setIsSubmittingComment(true);
        const author: ForumAuthor = {
            uid: user.uid,
            name: profile.fullName,
            avatarUrl: profile.avatarUrl,
        };

        const success = await addCommentToReply(post.id, reply.id, author, commentContent);
        if (success) {
            setCommentContent('');
            toast({ title: 'Yorumunuz gönderildi!' });
        } else {
            toast({ title: 'Hata', description: 'Yorumunuz gönderilemedi.', variant: 'destructive' });
        }
        setIsSubmittingComment(false);
    };

    return (
        <Card key={reply.id} className="bg-muted/50">
            <CardContent className="p-4">
                <div className="flex gap-4">
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
                        <Collapsible>
                            <div className='mt-3 flex items-center gap-2'>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn("flex items-center gap-2 text-muted-foreground", reply.upvotedBy.includes(user?.uid || '') && "text-primary")}
                                    onClick={() => handleUpvote(reply.id)}
                                    disabled={!user}
                                >
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{reply.upvotedBy.length > 0 ? reply.upvotedBy.length : ''}</span>
                                </Button>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>{reply.commentCount > 0 ? reply.commentCount : ''}</span>
                                    </Button>
                                </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent className="space-y-4 pt-4">
                                <div className="space-y-3">
                                    {comments?.map(comment => (
                                        <div key={comment.id} className="flex items-start gap-2 text-sm">
                                            <Avatar className='h-7 w-7'>
                                                <AvatarImage src={comment.author.avatarUrl} data-ai-hint="teacher portrait" />
                                                <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="bg-background rounded-lg px-3 py-2 flex-1">
                                                <span className="font-semibold">{comment.author.name}</span>
                                                <p className="text-muted-foreground">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
                                    <Input
                                        placeholder="Yorum yaz..."
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        disabled={isSubmittingComment}
                                    />
                                    <Button type="submit" size="icon" disabled={!commentContent.trim() || isSubmittingComment}>
                                        {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                                    </Button>
                                </form>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function PostDetailPageContent() {
  const params = useParams();
  const postId = params.id as string;
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid);
  const { post, replies, comments, isLoading } = useForumPost(postId);
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
               <ReplyCard key={reply.id} reply={reply} comments={comments[reply.id] || []} user={user} post={post} profile={profile} />
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
