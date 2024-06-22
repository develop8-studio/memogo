import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { collection, addDoc, query, where, getDocs, serverTimestamp, DocumentData } from 'firebase/firestore';

interface Comment {
    memoId: string;
    userId: string;
    displayName: string;
    text: string;
    createdAt: any;
}

interface CommentsProps {
    memoId: string;
}

const Comments = ({ memoId }: CommentsProps) => {
    const [comment, setComment] = useState<string>('');
    const [comments, setComments] = useState<Comment[]>([]);
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchComments = async () => {
            const q = query(collection(db, 'comments'), where('memoId', '==', memoId));
            const querySnapshot = await getDocs(q);
            const fetchedComments: Comment[] = querySnapshot.docs.map(doc => doc.data() as Comment);
            setComments(fetchedComments);
        };
        fetchComments();
    }, [memoId]);

    const handleComment = async () => {
        if (!currentUser) return;
        await addDoc(collection(db, 'comments'), {
            memoId,
            userId: currentUser.uid,
            displayName: currentUser.displayName,
            text: comment,
            createdAt: serverTimestamp()
        });
        setComment('');
    };

    return (
        <div>
            <div className="mb-4">
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                    placeholder="Write a comment..."
                />
                <button onClick={handleComment} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Comment
                </button>
            </div>
            <div>
                {comments.map((c, index) => (
                    <div key={index} className="mb-2 border-b pb-2">
                        <strong>{c.displayName}</strong>
                        <p>{c.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Comments;