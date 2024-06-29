import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Button, Input, Text, Avatar, Box, VStack, HStack, Divider, Link, Image } from '@chakra-ui/react';
import NextLink from 'next/link';

interface Comment {
    memoId: string;
    userId: string;
    displayName: string;
    photoURL: string;
    text: string;
    createdAt: any;
}

interface CommentsProps {
    memoId: string;
}

const Comments = ({ memoId }: CommentsProps) => {
    const [comment, setComment] = useState<string>('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [displayName, setDisplayName] = useState<string>('Anonymous');
    const [photoURL, setPhotoURL] = useState<string>('/default-avatar.png');
    const currentUser = auth.currentUser;

    const fetchComments = async () => {
        const q = query(collection(db, 'comments'), where('memoId', '==', memoId));
        const querySnapshot = await getDocs(q);
        const fetchedComments: Comment[] = querySnapshot.docs.map(doc => doc.data() as Comment);
        setComments(fetchedComments);
    };

    useEffect(() => {
        if (currentUser) {
            const fetchUserDetails = async () => {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setDisplayName(userData.displayName || 'Anonymous');
                    setPhotoURL(userData.photoURL || '/default-avatar.png');
                }
            };
            fetchUserDetails();
        }
        fetchComments();
    }, [memoId, currentUser]);

    const handleComment = async () => {
        if (!currentUser) return;
        await addDoc(collection(db, 'comments'), {
            memoId,
            userId: currentUser.uid,
            displayName,
            photoURL,
            text: comment,
            createdAt: serverTimestamp()
        });
        setComment('');
        fetchComments();
    };

    return (
        <Box w="full">
            <HStack mt={5} spacing={2.5}>
                <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment..."
                />
                <Button onClick={handleComment} colorScheme="blue" borderRadius="md">
                    Comment
                </Button>
            </HStack>
            <VStack align="start" spacing={3} className="mt-5">
                {comments.map((c, index) => (
                    <Box key={index} w="full">
                        <HStack align="start">
                            <NextLink href={`/user?id=${c.userId}`} passHref>
                                <Avatar src={c.photoURL} name={c.userId} size="md" />
                            </NextLink>
                            <VStack align="start" spacing={1}>
                                <NextLink href={`/user?id=${c.userId}`} passHref>
                                    <Text fontWeight="bold">{c.displayName}</Text>
                                </NextLink>
                                <Text>{c.text}</Text>
                            </VStack>
                        </HStack>
                        {index < comments.length - 1 && <Divider mt={3} />}
                    </Box>
                ))}
            </VStack>
        </Box>
    );
};

export default Comments;