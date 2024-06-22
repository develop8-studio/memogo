import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, DocumentData } from 'firebase/firestore';

interface User {
    photoURL: string;
    displayName: string;
    bio: string;
}

interface Memo {
    content: string;
}

const UserPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [user, setUser] = useState<User | null>(null);
    const [memos, setMemos] = useState<Memo[]>([]);

    useEffect(() => {
        const fetchUser = async () => {
        if (id && typeof id === 'string') {
            const docRef = doc(db, 'users', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
            setUser(docSnap.data() as User);
            } else {
            console.log('No such user!');
            }
        }
        };

        const fetchMemos = async () => {
        if (id && typeof id === 'string') {
            const q = query(collection(db, 'memos'), where('userId', '==', id));
            const querySnapshot = await getDocs(q);
            setMemos(querySnapshot.docs.map(doc => doc.data() as Memo));
        }
        };

        fetchUser();
        fetchMemos();
    }, [id]);

    if (!user) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-4">
        <div className="flex items-center space-x-4">
            <img src={user.photoURL} alt={user.displayName} className="w-16 h-16 rounded-full" />
            <div>
            <h1 className="text-xl font-bold">{user.displayName}</h1>
            <p>{user.bio}</p>
            </div>
        </div>
        <div className="mt-4">
            <h2 className="text-lg font-bold">Memos</h2>
            <ul>
            {memos.map((memo, index) => (
                <li key={index}>{memo.content}</li>
            ))}
            </ul>
        </div>
        </div>
    );
};

export default UserPage;