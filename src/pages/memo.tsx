import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import LikeButton from '../components/LikeButton';
import Comments from '../components/Comments';
import BookmarkButton from '../components/BookmarkButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Memo = () => {
    const router = useRouter();
    const { id } = router.query;
    const [content, setContent] = useState('');

    useEffect(() => {
        const fetchMemo = async () => {
            if (typeof id === 'string') {
                const docRef = doc(db, 'memos', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setContent(docSnap.data().content);
                } else {
                    console.log('No such document!');
                }
            } else {
                console.log('Invalid ID type');
            }
        };
        fetchMemo();
    }, [id]);

    return (
        <div className="container mx-auto p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
            {typeof id === 'string' && (
                <>
                    <LikeButton memoId={id} />
                    <BookmarkButton memoId={id} />
                    <Comments memoId={id} />
                </>
            )}
        </div>
    );
};

export default Memo;