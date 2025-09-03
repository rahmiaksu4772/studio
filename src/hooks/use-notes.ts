
'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import type { Note } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, updateDoc, where, getDocs } from 'firebase/firestore';

export function useNotes(userId?: string) {
  const { toast } = useToast();
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      setNotes([]);
      return;
    }

    setIsLoading(true);
    const notesCollectionRef = collection(db, `users/${userId}/notes`);
    
    // Instead of a single query requiring a composite index, we'll use two separate queries
    // and combine the results. This is more resilient if the index hasn't been created yet.
    
    const qPinned = query(notesCollectionRef, where('isPinned', '==', true), orderBy('date', 'desc'));
    const qUnpinned = query(notesCollectionRef, where('isPinned', '==', false), orderBy('date', 'desc'));

    const unsubscribePinned = onSnapshot(qPinned, (pinnedSnapshot) => {
        const pinnedNotes = pinnedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
        
        const unsubscribeUnpinned = onSnapshot(qUnpinned, (unpinnedSnapshot) => {
            const unpinnedNotes = unpinnedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
            
            // Also fetch notes that might not have the isPinned field (legacy data)
            const qLegacy = query(notesCollectionRef, where('isPinned', '==', null));
            getDocs(qLegacy).then(legacySnapshot => {
                 const legacyNotes = legacySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
                 const allUnpinned = [...unpinnedNotes, ...legacyNotes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                 setNotes([...pinnedNotes, ...allUnpinned]);
                 setIsLoading(false);
            });

        }, (error) => {
             console.error("Error fetching unpinned notes:", error);
             toast({ title: "Hata", description: "Notlar yüklenirken bir hata oluştu (unpinned).", variant: "destructive" });
             setIsLoading(false);
        });

        return () => unsubscribeUnpinned();

    }, (error) => {
        console.error("Error fetching pinned notes:", error);
        toast({ title: "Hata", description: "Notlar yüklenirken bir hata oluştu (pinned).", variant: "destructive" });
        setIsLoading(false);
    });

    return () => unsubscribePinned();
  }, [userId, toast]);

  const addNote = async (noteData: Omit<Note, 'id'>) => {
    if (!userId) {
        toast({ title: 'Hata', description: 'Not eklemek için kullanıcı girişi gereklidir.', variant: 'destructive'});
        return;
    }

    const dataToSave: { [key: string]: any } = { 
        ...noteData,
        isPinned: noteData.isPinned || false, // Ensure isPinned is never undefined
    };

    if (!dataToSave.imageUrl) {
        delete dataToSave.imageUrl;
    }
    
    try {
        const notesCollectionRef = collection(db, `users/${userId}/notes`);
        await addDoc(notesCollectionRef, dataToSave);
    } catch (error) {
        console.error("Error adding note to Firestore:", error);
        toast({
            title: 'Hata!',
            description: 'Notunuz veritabanına kaydedilirken bir hata oluştu.',
            variant: 'destructive',
        });
    }
  };

  const updateNote = async (noteId: string, data: Partial<Note>) => {
    if (!userId) {
        toast({ title: 'Hata', description: 'Not güncellemek için kullanıcı girişi gereklidir.', variant: 'destructive'});
        return;
    }
    try {
        const noteDocRef = doc(db, `users/${userId}/notes`, noteId);
        
        const dataToUpdate = {...data};
        if (dataToUpdate.isPinned === undefined) {
            delete dataToUpdate.isPinned;
        }

        await updateDoc(noteDocRef, dataToUpdate);
    } catch (error) {
        console.error("Error updating note in Firestore:", error);
        toast({
            title: 'Hata!',
            description: 'Notunuz güncellenirken bir hata oluştu.',
            variant: 'destructive',
        });
    }
  };


  const deleteNote = async (noteId: string) => {
     if (!userId) {
        toast({ title: 'Hata', description: 'Not silmek için kullanıcı girişi gereklidir.', variant: 'destructive'});
        return;
    }
    try {
        const noteDocRef = doc(db, `users/${userId}/notes`, noteId);
        await deleteDoc(noteDocRef);
        toast({
            title: 'Not Silindi',
            description: 'Notunuz başarıyla silindi.',
            variant: 'destructive',
        });
    } catch(error) {
         console.error("Error deleting note from Firestore:", error);
         toast({
            title: 'Hata!',
            description: 'Notunuz silinirken bir hata oluştu.',
            variant: 'destructive',
        });
    }
  };

  return { notes, isLoading, addNote, updateNote, deleteNote };
}
