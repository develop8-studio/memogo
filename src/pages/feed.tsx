import { useState, useEffect } from 'react';
import { db } from '@/firebase/firebaseConfig';
import { collection, query, getDocs, orderBy, doc, getDoc, startAfter, limit } from 'firebase/firestore';
import Link from 'next/link';
import { Box, VStack, HStack, Avatar, Heading, Text, Button } from '@chakra-ui/react';
import Layout from '@/components/Layout';
import Head from 'next/head';

interface Memo {
    id: string;
    userId: string;
    title: string;
    description: string;
    content: string;
    createdAt: any;
    photoURL: string;
    displayName: string;
}

const Feed = () => {
    const [memos, setMemos] = useState<Memo[]>([]);
    const [lastVisible, setLastVisible] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadedMemoIds, setLoadedMemoIds] = useState<Set<string>>(new Set());

    const fetchMemos = async (initial = false) => {
        setLoading(true);
        let q = query(collection(db, 'memos'), orderBy('createdAt', 'desc'), limit(10));
        if (lastVisible && !initial) {
            q = query(collection(db, 'memos'), orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(10));
        }
        const querySnapshot = await getDocs(q);
        const memosData: Memo[] = [];
        const newLoadedMemoIds = new Set(loadedMemoIds);

        for (const memoDoc of querySnapshot.docs) {
            const memoId = memoDoc.id;
            if (!newLoadedMemoIds.has(memoId)) {
                newLoadedMemoIds.add(memoId);
                const memoData = memoDoc.data();
                if (memoData && memoData.userId) {
                    const userDocRef = doc(db, 'users', memoData.userId);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        memosData.push({
                            id: memoId,
                            ...memoData,
                            photoURL: userData.photoURL || '/default-avatar.png',
                            displayName: userData.displayName || 'Anonymous',
                        } as Memo);
                    }
                }
            }
        }

        if (initial) {
            setMemos(memosData);
        } else {
            setMemos((prevMemos) => [...prevMemos, ...memosData]);
        }
        setLoadedMemoIds(newLoadedMemoIds);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setLoading(false);
    };

    useEffect(() => {
        fetchMemos(true);
    }, []);

    return (
        <div className="container mx-auto my-10">
            <Head>
                <title>Feed</title>
            </Head>
            <Layout>
                <VStack spacing={5} align="stretch">
                    {memos.map((memo) => (
                        <Box key={memo.id} className="p-5 shadow-sm border rounded-md">
                            <HStack spacing={3} align="center">
                                <Link href={`/user?id=${memo.userId}`} passHref>
                                    <Avatar src={memo.photoURL} size="md" />
                                </Link>
                                <VStack align="start" spacing={1}>
                                    <Link href={`/user?id=${memo.userId}`} passHref>
                                        <Text fontWeight="bold">{memo.displayName}</Text>
                                    </Link>
                                    <Text className="text-sm text-gray-500">{memo.createdAt?.toDate().toLocaleString()}</Text>
                                </VStack>
                            </HStack>
                            <Box className="mt-[15px]">
                                <Link href={`/memo?id=${memo.id}`} passHref>
                                    <Heading size="md">{memo.title}</Heading>
                                    <Text className="mt-[7.5px]">{memo.description}</Text>
                                </Link>
                            </Box>
                        </Box>
                    ))}
                </VStack>
                {loading ? (
                    <div className='w-full flex items-center justify-center'>
                    <Button onClick={() => fetchMemos()} isDisabled={loading} mt={5} disabled>
                        Loading...
                    </Button>
                </div>
                ) : (
                    <div className='w-full flex items-center justify-center'>
                        <Button onClick={() => fetchMemos()} isDisabled={loading} mt={5}>
                            Load more...
                        </Button>
                    </div>
                )}
            </Layout>
        </div>
    );
};

export default Feed;