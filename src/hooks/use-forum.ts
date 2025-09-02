
'use client';

import * as React from 'react';
import { db } from '@/lib/firebase';
import { 
    collection, 
    query, 
    orderBy, 
    onSnapshot, 
    addDoc, 
    serverTimestamp,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    getDoc,
} from 'firebase/firestore';
import { useToast } from './use-toast';
import type { ForumPost, ForumReply, ForumComment } from '@/lib/types';
import { useAuth } from './use-auth';

// Hook to fetch all forum posts
export function useForum() {
  const { toast } = useToast();
  const [posts, setPosts] = React.useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    const postsQuery = query(collection(db, 'forum'), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumPost));
      setPosts(postsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching forum posts:", error);
      toast({
        title: "Forum Yüklenemedi",
        description: "Gönderiler yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  return { posts, isLoading };
}


// Hook to fetch a single post and its replies
export function useForumPost(postId: string) {
    const { toast } = useToast();
    const [post, setPost] = React.useState<ForumPost | null>(null);
    const [replies, setReplies] = React.useState<ForumReply[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
  
    React.useEffect(() => {
      if (!postId) {
          setIsLoading(false);
          return;
      };
      
      setIsLoading(true);
      const postDocRef = doc(db, 'forum', postId);

      const unsubscribePost = onSnapshot(postDocRef, (docSnap) => {
          if (docSnap.exists()) {
              setPost({ id: docSnap.id, ...docSnap.data() } as ForumPost);
          } else {
              setPost(null);
          }
          // Post loading is done, but replies might still be loading
      }, (error) => {
          console.error(`Error fetching post ${postId}:`, error);
          toast({ title: "Hata", description: "Gönderi yüklenemedi.", variant: "destructive" });
      });

      const repliesQuery = query(collection(db, `forum/${postId}/replies`), orderBy('date', 'asc'));
      const unsubscribeReplies = onSnapshot(repliesQuery, (snapshot) => {
        const repliesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumReply));
        setReplies(repliesData);
        setIsLoading(false); // All data is loaded
      }, (error) => {
        console.error(`Error fetching replies for post ${postId}:`, error);
        toast({ title: "Hata", description: "Cevaplar yüklenemedi.", variant: "destructive" });
        setIsLoading(false);
      });
  
      return () => {
        unsubscribePost();
        unsubscribeReplies();
      };
    }, [postId, toast]);
  
    return { post, replies, isLoading };
}

// Function to add a new post
export const addPost = async (postData: Omit<ForumPost, 'id' | 'date'>) => {
    try {
      await addDoc(collection(db, 'forum'), {
        ...postData,
        date: new Date().toISOString(), // Use client-side ISO string
      });
      return true;
    } catch (error) {
      console.error("Error adding post:", error);
      return false;
    }
};

// Function to add a reply
export const addReply = async (postId: string, replyData: Omit<ForumReply, 'id' | 'date' | 'upvotedBy' | 'comments'>) => {
    try {
        await addDoc(collection(db, `forum/${postId}/replies`), {
            ...replyData,
            date: new Date().toISOString(),
            upvotedBy: [],
            comments: [],
        });
        return true;
    } catch (error) {
        console.error("Error adding reply:", error);
        return false;
    }
};

// Function to add a comment to a reply
export const addCommentToReply = async (postId: string, replyId: string, commentData: Omit<ForumComment, 'id' | 'date'>) => {
    const replyRef = doc(db, `forum/${postId}/replies`, replyId);
    try {
        const newComment: ForumComment = {
            id: new Date().getTime().toString(), // Simple unique ID
            ...commentData,
            date: new Date().toISOString(),
        };
        await updateDoc(replyRef, {
            comments: arrayUnion(newComment)
        });
        return true;
    } catch (error) {
        console.error("Error adding comment to reply:", error);
        return false;
    }
};


// Function to upvote/downvote a reply
export const toggleUpvote = async (postId: string, replyId: string, userId: string) => {
    const replyRef = doc(db, `forum/${postId}/replies`, replyId);
    try {
        const replySnap = await getDoc(replyRef);
        if(!replySnap.exists()) return;

        const upvotedBy = replySnap.data().upvotedBy || [];
        if(upvotedBy.includes(userId)){
            // User has upvoted, so remove upvote
            await updateDoc(replyRef, {
                upvotedBy: arrayRemove(userId)
            });
        } else {
            // User has not upvoted, so add upvote
            await updateDoc(replyRef, {
                upvotedBy: arrayUnion(userId)
            });
        }
    } catch (error) {
        console.error("Error toggling upvote:", error);
    }
}
