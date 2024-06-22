import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

interface Memo {
    title: string;
    description: string;
    uid: string;
}

const BookmarkedMemos = () => {
    const [memos, setMemos] = useState<Memo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookmarkedMemos = async (userId: string) => {
            const q = query(collection(db, 'bookmarks'), where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            const bookmarkedMemos: Memo[] = [];

            for (let bookmarkDoc of querySnapshot.docs) {
                const memoId = bookmarkDoc.data().memoId;
                const memoDocRef = doc(db, 'memos', memoId);
                const memoDoc = await getDoc(memoDocRef);
                if (memoDoc.exists()) {
                    const memoData = memoDoc.data() as Memo;
                    memoData.uid = memoId;  // メモのUUIDを保存
                    bookmarkedMemos.push(memoData);
                }
            }

            setMemos(bookmarkedMemos);
            setLoading(false);
        };

        onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchBookmarkedMemos(user.uid);
            } else {
                setLoading(false);
            }
        });
    }, [auth]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">Bookmarked Memos</h1>
            {memos.length > 0 ? (
                memos.map((memo, index) => (
                    <Link href={`/memo?id=${memo.uid}`} key={index} className="block mb-4 p-4 border rounded hover:bg-gray-100">
                        <h2 className="text-lg font-bold">{memo.title}</h2>
                        <p>{memo.description}</p>
                    </Link>
                ))
            ) : (
                <p>No bookmarked memos found.</p>
            )}
        </div>
    );
};

export default BookmarkedMemos;