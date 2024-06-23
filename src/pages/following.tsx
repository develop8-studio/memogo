import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Heading, Text, Avatar, Box, VStack, HStack } from '@chakra-ui/react';
import Head from 'next/head';
import Layout from '@/components/Layout';

interface User {
    uid: string;
    photoURL: string;
    displayName: string;
    bio: string;
}

const Following = () => {
    const [following, setFollowing] = useState<User[]>([]);
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchFollowing = async () => {
            if (currentUser) {
                const q = query(collection(db, 'follows'), where('followerId', '==', currentUser.uid));
                const querySnapshot = await getDocs(q);
                const followedUsers: User[] = [];

                for (const docSnap of querySnapshot.docs) {
                    const userId = docSnap.data().followingId;
                    const userDocRef = doc(db, 'users', userId);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        followedUsers.push({ uid: userDoc.id, ...userDoc.data() } as User);
                    }
                }

                setFollowing(followedUsers);
            }
        };

        fetchFollowing();
    }, [currentUser]);

    if (!currentUser) return <div>Loading...</div>;

    return (
        <div className="container mx-auto my-10">
            <Head>
                <title>Following</title>
            </Head>
            <Layout>
                <Heading size="md" className="mb-5">Following</Heading>
                <VStack spacing={4} align="start">
                    {following.map((user) => (
                        <Box key={user.uid} w="100%" p={3} borderWidth={1} borderRadius="md">
                            <HStack spacing={3} align="center">
                                <Link href={`/user?id=${user.uid}`} passHref>
                                    <Avatar src={user.photoURL} size="md" />
                                </Link>
                                <VStack align="start" spacing={0}>
                                    <Link href={`/user?id=${user.uid}`} passHref>
                                        <h3 className="font-bold text-md">{user.displayName}</h3>
                                    </Link>
                                    {/* <Text>{user.bio}</Text> */}
                                </VStack>
                            </HStack>
                        </Box>
                    ))}
                </VStack>
            </Layout>
        </div>
    );
};

export default Following;