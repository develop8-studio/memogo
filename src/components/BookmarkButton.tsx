import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { Button } from '@chakra-ui/react';
import { FaBookmark } from 'react-icons/fa';

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
        <Button
            onClick={handleBookmark}
            background="none"
            border="none"
            p="0"
            minW="auto"
            height="auto"
            sx={{
                '&:hover': {
                    background: 'none',
                    color: 'inherit',
                },
            }}
        >
            <FaBookmark className={`${bookmarked ? 'text-yellow-500' : 'text-slate-300'}`} />
        </Button>
    );
};

export default BookmarkButton;