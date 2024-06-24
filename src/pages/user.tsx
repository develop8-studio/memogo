import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { Heading, Text, Button } from '@chakra-ui/react';
import Head from 'next/head';

interface User {
    photoURL: string;
    displayName: string;
    bio: string;
}

interface Memo {
    content: string;
    uid: string;
    title: string;
    description: string;
}

const UserPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [user, setUser] = useState<User | null>(null);
    const [memos, setMemos] = useState<Memo[]>([]);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchUser = async () => {
            if (id && typeof id === 'string') {
                const docRef = doc(db, 'users', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUser(docSnap.data() as User);
                } else {
                    console.log('No such user!');
                }
            }
        };

        const fetchMemos = async () => {
            if (id && typeof id === 'string') {
                const q = query(collection(db, 'memos'), where('userId', '==', id));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    setMemos(querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as Memo)));
                } else {
                    console.log('No memos found for this user.');
                }
            }
        };

        const checkFollowingStatus = async () => {
            if (currentUser && id && typeof id === 'string') {
                const q = query(collection(db, 'follows'), where('followerId', '==', currentUser.uid), where('followingId', '==', id));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    setIsFollowing(true);
                }
            }
        };

        fetchUser();
        fetchMemos();
        checkFollowingStatus();
    }, [id, currentUser]);

    const handleFollow = async () => {
        if (currentUser && id && typeof id === 'string') {
            await addDoc(collection(db, 'follows'), {
                followerId: currentUser.uid,
                followingId: id
            });
            setIsFollowing(true);
        }
    };

    const handleUnfollow = async () => {
        if (currentUser && id && typeof id === 'string') {
            const q = query(collection(db, 'follows'), where('followerId', '==', currentUser.uid), where('followingId', '==', id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
            setIsFollowing(false);
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="container mx-auto my-10">
            <Head><title>{user.displayName}</title></Head>
            <Layout>
                <div className="flex items-center">
                    <img src={user.photoURL} alt={user.displayName} className="w-20 h-20 rounded-full mr-3 border" />
                    <div>
                        <Heading size="md">{user.displayName}</Heading>
                        <Text className="text-slate-500 lg:whitespace-pre-line">{user.bio}</Text>
                    </div>
                    <div className="ml-auto">
                        {currentUser && currentUser.uid !== id && (
                            <Button
                                onClick={isFollowing ? handleUnfollow : handleFollow}
                                colorScheme={isFollowing ? 'red' : 'blue'}
                                className='ml-3'
                            >
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </Button>
                        )}
                        {currentUser && currentUser.uid === id && (
                            <Button className='ml-3'>
                                <Link href="/settings/account">Edit profile</Link>
                            </Button>
                        )}
                    </div>
                </div>
                <div className="mt-[30px]">
                    <ul className="space-y-3">
                        {memos.map((memo, index) => (
                            <li key={index} className="p-[15px] border rounded-md hover:bg-slate-50 transition-colors">
                                <Link href={`/memo?id=${memo.uid}`}>
                                    <h2 className="text-lg font-bold">{memo.title}</h2>
                                    <p>{memo.description}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </Layout>
        </div>
    );
};

export default UserPage;