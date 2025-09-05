
'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import type { UserProfile } from './use-user-profile';
import type { ClassInfo, Student } from '@/lib/types';


export type UserData = UserProfile & {
    id: string;
    classes: ClassInfo[];
}

export function useAllUsersData(isAdmin: boolean) {
    const { toast } = useToast();
    const [usersData, setUsersData] = React.useState<UserData[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (!isAdmin) {
            setIsLoading(false);
            setUsersData([]);
            return;
        }

        setIsLoading(true);
        const usersRef = collection(db, 'users');

        const unsubscribe = onSnapshot(usersRef, async (usersSnapshot) => {
            const allDataPromises = usersSnapshot.docs.map(async (userDoc) => {
                const userProfile = { id: userDoc.id, ...userDoc.data() } as UserProfile & { id: string };

                const classesRef = collection(db, `users/${userDoc.id}/classes`);
                const classesSnapshot = await getDocs(classesRef);
                
                const classesDataPromises = classesSnapshot.docs.map(async (classDoc) => {
                    const classInfo = { id: classDoc.id, ...classDoc.data() } as ClassInfo;
                    
                    const studentsRef = collection(db, `users/${userDoc.id}/classes/${classDoc.id}/students`);
                    const studentsSnapshot = await getDocs(studentsRef);
                    classInfo.students = studentsSnapshot.docs.map(sDoc => ({ id: sDoc.id, ...sDoc.data() } as Student));

                    return classInfo;
                });

                const classesData = await Promise.all(classesDataPromises);

                return {
                    ...userProfile,
                    classes: classesData
                };
            });

            const allData = await Promise.all(allDataPromises);
            setUsersData(allData);
            setIsLoading(false);

        }, (error) => {
            console.error("Error fetching all users data:", error);
            toast({
                title: "Veriler Yüklenemedi",
                description: "Tüm kullanıcı verileri yüklenirken bir sorun oluştu.",
                variant: "destructive"
            });
            setIsLoading(false);
        });


        return () => unsubscribe();
    }, [isAdmin, toast]);

    return { usersData, isLoading, setUsersData };
}
