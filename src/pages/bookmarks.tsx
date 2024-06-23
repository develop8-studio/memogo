import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Head from 'next/head';
import { Heading } from '@chakra-ui/react';
import useAuthRedirect from '@/hooks/useAuthRedirect';

interface Memo {
    title: string;
    description: string;
    uid: string;
}

const BookmarkedMemos = () => {
    useAuthRedirect();
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
                    memoData.uid = memoId;
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
        <div className="container mx-auto my-10">
            <Head>
                <title>Bookmarks</title>
            </Head>
            <Layout>
                <Heading size="md" className='mb-5'>Bookmarks</Heading>
                {memos.length > 0 ? (
                    memos.map((memo, index) => (
                        <Link href={`/memo?id=${memo.uid}`} key={index} className="block mb-3 p-[15px] border rounded-md hover:bg-slate-50 transition-colors">
                            <h2 className="text-lg font-bold">{memo.title}</h2>
                            <p>{memo.description}</p>
                        </Link>
                    ))
                ) : (
                    <p>No bookmarked memos found.</p>
                )}
            </Layout>
        </div>
    );
};

export default BookmarkedMemos;