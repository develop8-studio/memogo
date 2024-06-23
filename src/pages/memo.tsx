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
import { Center, Heading, Text, Button, Menu, MenuButton, MenuList, MenuItem, } from '@chakra-ui/react';
import Layout from '@/components/Layout';
import { onAuthStateChanged } from 'firebase/auth';
import { FaChevronDown } from 'react-icons/fa';
import { ChevronDownIcon } from '@chakra-ui/icons'

interface MemoData {
    title: string;
    description: string;
    content: string;
    userId: string; // 投稿者のIDを追加
}

const Memo = () => {
    const router = useRouter();
    const { id } = router.query;
    const [memoData, setMemoData] = useState<MemoData | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
                        <Center className="flex flex-col mb-5">
                            <Heading className="mb-2.5">{memoData.title}</Heading>
                            <Text>{memoData.description}</Text>
                        </Center>
                        {memoData.userId === currentUserId && (
                            <div className='mb-10 flex justify-end'>
                                <Menu>
                                <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                                    Details
                                </MenuButton>
                                <MenuList>
                                    <MenuItem onClick={deleteMemo}>Delete</MenuItem>
                                    {/* <MenuItem>Create a Copy</MenuItem>
                                    <MenuItem>Mark as Draft</MenuItem>
                                    <MenuItem>Delete</MenuItem>
                                    <MenuItem>Attend a Workshop</MenuItem> */}
                                </MenuList>
                                </Menu>
                            {/* <Button colorScheme="red" onClick={deleteMemo} className="mb-5">
                                Delete
                            </Button> */}
                            </div>
                        )}
                    </Layout>
                )}
                <Layout>
                    <div className="mb-5">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {memoData ? memoData.content : ''}
                        </ReactMarkdown>
                    </div>
                </Layout>
                <Layout>
                    {typeof id === 'string' && (
                        <>
                            <LikeButton memoId={id} />
                            <BookmarkButton memoId={id} />
                            <Comments memoId={id} />
                        </>
                    )}
                </Layout>
            </div>
        </>
    );
};

export default Memo;