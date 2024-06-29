import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { Heading, Text, Button, Spinner, Avatar, Image } from '@chakra-ui/react';
import Head from 'next/head';
import { FiTwitter } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

interface User {
    photoURL: string;
    displayName: string;
    bio: string;
    twitter?: string;
    headerPhotoURL?: string;
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
    const [isMutualFollowing, setIsMutualFollowing] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [followerCount, setFollowerCount] = useState<number>(0);
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (id && typeof id === 'string') {
                    const docRef = doc(db, 'users', id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUser(docSnap.data() as User);
                    } else {
                        setError('No such user!');
                    }
                }
            } catch (err) {
                setError('Failed to fetch user data');
                console.error(err);
            }
        };

        const fetchMemos = async () => {
            try {
                if (id && typeof id === 'string') {
                    const q = query(collection(db, 'memos'), where('userId', '==', id));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        setMemos(querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as Memo)));
                    } else {
                        setError('No memos found for this user.');
                    }
                }
            } catch (err) {
                setError('Failed to fetch memos');
                console.error(err);
            }
        };

        const checkFollowingStatus = async () => {
            try {
                if (currentUser && id && typeof id === 'string') {
                    const followQuery = query(collection(db, 'follows'), where('followerId', '==', currentUser.uid), where('followingId', '==', id));
                    const followSnapshot = await getDocs(followQuery);
                    if (!followSnapshot.empty) {
                        setIsFollowing(true);
                    }

                    const mutualFollowQuery = query(collection(db, 'follows'), where('followerId', '==', id), where('followingId', '==', currentUser.uid));
                    const mutualFollowSnapshot = await getDocs(mutualFollowQuery);
                    if (!mutualFollowSnapshot.empty) {
                        setIsMutualFollowing(true);
                    }
                }
            } catch (err) {
                setError('Failed to check following status');
                console.error(err);
            }
        };

        const fetchFollowerCount = async () => {
            try {
                if (id && typeof id === 'string') {
                    const q = query(collection(db, 'follows'), where('followingId', '==', id));
                    const querySnapshot = await getDocs(q);
                    setFollowerCount(querySnapshot.size);
                }
            } catch (err) {
                setError('Failed to fetch follower count');
                console.error(err);
            }
        };

        const fetchData = async () => {
            setLoading(true);
            await fetchUser();
            await fetchMemos();
            await checkFollowingStatus();
            await fetchFollowerCount();
            setLoading(false);
        };

        fetchData();
    }, [id, currentUser]);

    const handleFollow = async () => {
        try {
            if (currentUser && id && typeof id === 'string') {
                await addDoc(collection(db, 'follows'), {
                    followerId: currentUser.uid,
                    followingId: id
                });
                setIsFollowing(true);
                setFollowerCount(prev => prev + 1); // Increase follower count locally
            }
        } catch (err) {
            setError('Failed to follow user');
            console.error(err);
        }
    };

    const handleUnfollow = async () => {
        try {
            if (currentUser && id && typeof id === 'string') {
                const q = query(collection(db, 'follows'), where('followerId', '==', currentUser.uid), where('followingId', '==', id));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });
                setIsFollowing(false);
                setFollowerCount(prev => prev - 1); // Decrease follower count locally
            }
        } catch (err) {
            setError('Failed to unfollow user');
            console.error(err);
        }
    };

    const generateChatRoomId = (userId1: string, userId2: string) => {
        return `${userId1}_${userId2}`;
    };

    const [chatRoomId, setChatRoomId] = useState<string | null>(null);

    useEffect(() => {
        const createOrFetchChatRoom = async () => {
            if (currentUser && id && typeof id === 'string') {
                const sortedIds = [currentUser.uid, id].sort();
                const newChatRoomId = generateChatRoomId(sortedIds[0], sortedIds[1]);
                setChatRoomId(newChatRoomId);
            }
        };
        createOrFetchChatRoom();
    }, [currentUser, id]);

    if (loading) return <div className="w-full min-h-screen flex justify-center items-center h-screen"><Spinner size="xl" /></div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!user) return <div>No user found</div>;

    return (
        <div className="container mx-auto my-10">
            <Head><title>{user.displayName}</title></Head>
            <Layout>
                {user.headerPhotoURL && (
                    <div className="w-fit h-fit border rounded-md overflow-hidden mb-5 hidden md:block">
                        <Image src={user.headerPhotoURL} alt="Header Image" className="w-full object-cover rounded-md" />
                    </div>
                )}
                <div className="contents lg:flex items-center mt-3 lg:mt-0">
                    <Avatar src={user.photoURL} name={user.displayName} size="lg" />
                    <div className='mt-3 lg:mt-0 lg:ml-3'>
                        <Heading size="md">{user.displayName}</Heading>
                        <Text className="text-slate-500 lg:whitespace-pre-line">{user.bio}</Text>
                    </div>
                    <div className="ml-auto mt-3 lg:mt-0">
                        {currentUser && currentUser.uid !== id && (
                            <>
                                <Button
                                    onClick={isFollowing ? handleUnfollow : handleFollow}
                                    className={`lg:ml-3 ${isFollowing ? 'bg-slate-100' : 'bg-white'}`}
                                    variant="outline"
                                >
                                    {isFollowing ? 'Unfollow' : 'Follow'}
                                </Button>
                                {isMutualFollowing && chatRoomId && (
                                    <Link href={`/chat?id=${chatRoomId}`}>
                                        <Button className='lg:ml-3' variant="outline">
                                            Chat
                                        </Button>
                                    </Link>
                                )}
                            </>
                        )}
                        {currentUser && currentUser.uid === id && (
                            <Button className='lg:ml-3' variant="outline">
                                <Link href="/settings">Edit profile</Link>
                            </Button>
                        )}
                    </div>
                </div>
                <Text className="text-slate-500 mt-3 text-sm">{followerCount} Followers</Text>
                {user.twitter && (
                    <div className="flex items-center mt-3">
                        <FiTwitter className='mr-1 text-lg' />
                        <Link href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer">
                            @{user.twitter}
                        </Link>
                    </div>
                )}
                <div className="mt-[30px]">
                    <ul className="space-y-3">
                        {memos.map((memo) => (
                            <li key={memo.uid} className="p-[15px] border rounded-md hover:bg-slate-50 transition-colors">
                                <Link href={`/memo?id=${memo.uid}`}>
                                    <h2 className="text-lg font-bold">{memo.title}</h2>
                                    <p>{memo.description.length > 100 ? `${memo.description.substring(0, 100)}...` : memo.description}</p>
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