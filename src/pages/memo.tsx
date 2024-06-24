import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { db, auth } from '@/firebase/firebaseConfig';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import LikeButton from '../components/LikeButton';
import Comments from '../components/Comments';
import BookmarkButton from '../components/BookmarkButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Head from 'next/head';
import { Center, Heading, Text, Button, Menu, MenuButton, MenuList, MenuItem, Divider, Avatar, HStack, VStack } from '@chakra-ui/react';
import Layout from '@/components/Layout';
import { onAuthStateChanged } from 'firebase/auth';
import { ChevronDownIcon } from '@chakra-ui/icons';
import Link from 'next/link';

interface MemoData {
    title: string;
    description: string;
    content: string;
    userId: string;
}

interface UserData {
    displayName: string;
    photoURL: string;
}

const Memo = () => {
    const router = useRouter();
    const { id } = router.query;
    const [memoData, setMemoData] = useState<MemoData | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [authorData, setAuthorData] = useState<UserData | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUserId(user.uid);
            } else {
                setCurrentUserId(null);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchMemo = async () => {
            if (typeof id === 'string') {
                const docRef = doc(db, 'memos', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as MemoData;
                    setMemoData(data);
                } else {
                    console.log('No such document!');
                }
            } else {
                console.log('Invalid ID type');
            }
        };
        fetchMemo();
    }, [id]);

    useEffect(() => {
        const fetchAuthorData = async () => {
            if (memoData && memoData.userId) {
                const userDocRef = doc(db, 'users', memoData.userId);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data() as UserData;
                    setAuthorData(userData);
                } else {
                    console.log('No such user document!');
                }
            }
        };
        fetchAuthorData();
    }, [memoData]);

    const deleteMemo = async () => {
        if (typeof id === 'string') {
            const docRef = doc(db, 'memos', id);
            await deleteDoc(docRef);
            alert('Memo deleted!');
            router.push('/feed'); // メモ削除後にフィードページにリダイレクト
        }
    };

    return (
        <>
            {memoData && (
                <Head>
                    <title>{memoData.title}</title>
                </Head>
            )}
            <div className='container mx-auto my-10'>
                {memoData && (
                    <Layout>
                        <div className="flex flex-col mb-5">
                            <Heading className="mb-2.5">{memoData.title}</Heading>
                            <Text>{memoData.description}</Text>
                            {authorData && (
                                <HStack spacing={3} className="mt-5 border p-1.5 rounded-md w-full">
                                    <Link href={`/user?id=${memoData.userId}`} passHref>
                                        <Avatar src={authorData.photoURL} size="md" />
                                    </Link>
                                    <VStack align="start" spacing={1}>
                                        <Link href={`/user?id=${memoData.userId}`} passHref>
                                            <Text fontWeight="bold">{authorData.displayName}</Text>
                                        </Link>
                                    </VStack>
                                </HStack>
                            )}
                        </div>
                        {memoData.userId === currentUserId && (
                            <div className='mb-10 flex justify-end'>
                                <Menu>
                                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                                        Details
                                    </MenuButton>
                                    <MenuList>
                                        <MenuItem onClick={deleteMemo}>Delete</MenuItem>
                                    </MenuList>
                                </Menu>
                            </div>
                        )}
                    </Layout>
                )}
                <Layout>
                    <div className="markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {memoData ? memoData.content : ''}
                        </ReactMarkdown>
                    </div>
                </Layout>
                <Divider className='my-10' />
                <Layout>
                    {typeof id === 'string' && (
                        <div>
                            <LikeButton memoId={id} />
                            <BookmarkButton memoId={id} />
                            <Comments memoId={id} />
                        </div>
                    )}
                </Layout>
            </div>
        </>
    );
};

export default Memo;