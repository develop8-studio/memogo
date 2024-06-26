import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import useAuthRedirect from "@/hooks/useAuthRedirect";
import { Spinner, Box, VStack, Image, Button, Link, Text } from '@chakra-ui/react';
import Layout from '@/components/Layout';
import Head from 'next/head';
import UserProfile from '@/components/game/UserProfile';
import Island from '@/components/game/Island';
import NextLink from "next/link"

const Game = () => {
    useAuthRedirect();

    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<{ displayName: string; photoURL: string; bio: string } | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const userDoc = doc(db, 'users', currentUser.uid);
                const userSnapshot = await getDoc(userDoc);
                if (userSnapshot.exists()) {
                    setUser(userSnapshot.data() as { displayName: string; photoURL: string; bio: string });
                }
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) return <div className="w-full min-h-screen flex justify-center items-center h-screen"><Spinner size="xl" /></div>;

    return (
        <div className="container mx-auto my-10">
            <Head>
                <title>昇格せよ シャチクのモリ</title>
            </Head>
            <Layout>

                <div className="space-y-5 mb-10">
                    <div className="w-full flex items-center justify-center border rounded-md">
                        <Image src="/game/title.png" className="w-[300px]" />
                    </div>
                    {user && <UserProfile photoURL={user.photoURL} displayName={user.displayName} bio={user.bio} />}
                    <Island />
                </div>
                <div className="w-fit ml-auto">
                    <NextLink href="/works/view"><Text>Play / 労働</Text></NextLink>
                </div>
            </Layout>
        </div>
    );
};

export default Game;