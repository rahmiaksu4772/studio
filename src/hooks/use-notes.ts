
'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import type { Note } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';

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
    const q = query(notesCollectionRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
      setNotes(notesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching notes from Firestore:", error);
      toast({
        title: "Notlar Yüklenemedi",
        description: "Notlarınız veritabanından yüklenirken bir sorun oluştu.",
        variant: "destructive"
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId, toast]);

  const addNote = async (noteData: Omit<Note, 'id'>) => {
    if (!userId) {
        toast({ title: 'Hata', description: 'Not eklemek için kullanıcı girişi gereklidir.', variant: 'destructive'});
        return;
    }

    const dataToSave: { [key: string]: any } = { ...noteData };

    if (!dataToSave.imageUrl) {
        delete dataToSave.imageUrl;
    }
    
    if (dataToSave.title.trim() === '' && dataToSave.content.trim() === '') {
        toast({
            title: 'Boş Not',
            description: 'Lütfen bir başlık veya içerik girin.',
            variant: 'destructive',
        });
        return;
    }

    try {
        const notesCollectionRef = collection(db, `users/${userId}/notes`);
        await addDoc(notesCollectionRef, dataToSave);
        toast({
          title: 'Not Eklendi!',
          description: 'Yeni notunuz başarıyla eklendi.',
        });
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
        await updateDoc(noteDocRef, data);
        toast({
            title: 'Not Güncellendi!',
            description: 'Notunuz başarıyla güncellendi.',
        });
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
