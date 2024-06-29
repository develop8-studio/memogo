import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Heading, Text, Avatar, Box, VStack, HStack, Spinner } from '@chakra-ui/react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import useAuthRedirect from '@/hooks/useAuthRedirect';

interface User {
    uid: string;
    photoURL: string;
    displayName: string;
    bio: string;
}

const Following = () => {
    useAuthRedirect();
    const [following, setFollowing] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchFollowing = async () => {
            if (currentUser) {
                try {
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
                } catch (error) {
                    console.error('Error fetching following users:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchFollowing();
    }, [currentUser]);

    if (loading) {
        return <div className="w-full min-h-screen flex justify-center items-center"><Spinner size="xl" /></div>;
    }

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
                                    <Avatar src={user.photoURL} name={user.displayName} size="md" />
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