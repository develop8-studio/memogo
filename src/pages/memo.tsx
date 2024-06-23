import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import LikeButton from '../components/LikeButton';
import Comments from '../components/Comments';
import BookmarkButton from '../components/BookmarkButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Head from 'next/head';
import { Center, Heading, Text } from '@chakra-ui/react';
import Layout from '@/components/Layout';

interface MemoData {
    title: string;
    description: string;
    content: string;
}

const Memo = () => {
    const router = useRouter();
    const { id } = router.query;
    const [memoData, setMemoData] = useState<MemoData | null>(null);

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
                        <Center className="flex flex-col mb-10">
                            <Heading className="mb-2.5">{memoData.title}</Heading>
                            <Text>{memoData.description}</Text>
                        </Center>
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