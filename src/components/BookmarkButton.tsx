import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

type BookmarkButtonProps = {
    memoId: string;
};

const BookmarkButton = ({ memoId }: BookmarkButtonProps) => {
    const [bookmarked, setBookmarked] = useState(false);
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchBookmark = async () => {
            if (!currentUser) return;
            const docRef = doc(db, 'bookmarks', `${currentUser.uid}_${memoId}`);
            const docSnap = await getDoc(docRef);
            setBookmarked(docSnap.exists());
        };
        fetchBookmark();
    }, [memoId, currentUser]);

    const handleBookmark = async () => {
        if (!currentUser) return;

        const docRef = doc(db, 'bookmarks', `${currentUser.uid}_${memoId}`);

        if (bookmarked) {
            await deleteDoc(docRef);
        } else {
            await setDoc(docRef, {
                userId: currentUser.uid,
                memoId,
                createdAt: new Date()
            });
        }
        setBookmarked(!bookmarked);
    };

    return (
        <button onClick={handleBookmark} className={`px-4 py-2 rounded ${bookmarked ? 'bg-yellow-500' : 'bg-gray-500'} text-white`}>
            {bookmarked ? 'Unbookmark' : 'Bookmark'}
        </button>
    );
};

export default BookmarkButton;