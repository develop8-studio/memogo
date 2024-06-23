import { useState, useEffect } from 'react';
import { db } from '@/firebase/firebaseConfig';
import { collection, query, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Box, VStack, HStack, Avatar, Heading, Text, Divider } from '@chakra-ui/react';
import Layout from '@/components/Layout';
import Head from 'next/head';

interface Memo {
    uid: string;
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

            for (const docSnap of querySnapshot.docs) {
                const memoData = docSnap.data();
                if (memoData.userId) {
                    const userDocRef = doc(db, 'users', memoData.userId);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        memosData.push({
                            uid: docSnap.id,
                            ...memoData,
                            photoURL: userDocSnap.data().photoURL,
                            displayName: userDocSnap.data().displayName,
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
                    <Box key={memo.uid} className="p-5 shadow-sm border rounded-md">
                        <HStack spacing={3} align="center">
                            <Link href={`/user?id=${memo.userId}`} passHref>
                                    <Avatar src={memo.photoURL} size="md" />
                            </Link>
                            <VStack align="start" spacing={1}>
                                <Link href={`/user?id=${memo.userId}`} passHref>
                                        <Text fontWeight="bold">{memo.displayName}</Text>
                                </Link>
                                <Text className="text-sm text-gray-500">{memo.createdAt.toDate().toLocaleString()}</Text>
                            </VStack>
                        </HStack>
                        <Box className='mt-[15px]'>
                            <Link href={`/memo?id=${memo.uid}`} passHref>
                                    <Heading size="md">{memo.title}</Heading>
                                    <Text className='mt-[7.5px]'>{memo.description}</Text>
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