import { useState, useEffect } from 'react';
import { db } from '@/firebase/firebaseConfig';
import { collection, query, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Box, VStack, HStack, Avatar, Heading, Text } from '@chakra-ui/react';
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

    useEffect(() => {
        const fetchMemos = async () => {
            const q = query(collection(db, 'memos'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const memosData: Memo[] = [];

            for (const memoDoc of querySnapshot.docs) {
                const memoId = memoDoc.id; // メモのIDを取得
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

            setMemos(memosData);
        };

        fetchMemos();
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
            </Layout>
        </div>
    );
};

export default Feed;