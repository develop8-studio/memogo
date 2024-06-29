import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { db, auth } from '@/firebase/firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import LikeButton from '../components/LikeButton';
import Comments from '../components/Comments';
import BookmarkButton from '../components/BookmarkButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Head from 'next/head';
import { Center, Heading, Text, Button, Menu, MenuButton, MenuList, MenuItem, Divider, Avatar, HStack, VStack, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Textarea, Spinner, Input } from '@chakra-ui/react';
import Layout from '@/components/Layout';
import { onAuthStateChanged } from 'firebase/auth';
import { ChevronDownIcon } from '@chakra-ui/icons';
import Link from 'next/link';

interface MemoData {
    title: string;
    description: string;
    content: string;
    userId: string;
}

interface UserData {
    displayName: string;
    photoURL: string;
}

const Memo = () => {
    const router = useRouter();
    const { id } = router.query;
    const [memoData, setMemoData] = useState<MemoData | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [authorData, setAuthorData] = useState<UserData | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editContent, setEditContent] = useState('');
    const [loading, setLoading] = useState<boolean>(true);
    const cancelRef = useRef(null);

    const onClose = () => setIsOpen(false);
    const onEditClose = () => setIsEditOpen(false);

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
            setLoading(true);
            try {
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
            } catch (error) {
                console.error('Error fetching memo:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMemo();
    }, [id]);

    useEffect(() => {
        const fetchAuthorData = async () => {
            if (memoData && memoData.userId) {
                try {
                    const userDocRef = doc(db, 'users', memoData.userId);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data() as UserData;
                        setAuthorData(userData);
                    } else {
                        console.log('No such user document!');
                    }
                } catch (error) {
                    console.error('Error fetching author data:', error);
                }
            }
        };
        fetchAuthorData();
    }, [memoData]);

    const deleteMemo = async () => {
        if (typeof id === 'string') {
            const docRef = doc(db, 'memos', id);
            await deleteDoc(docRef);
            setIsOpen(false);
            router.push('/feed');
        }
    };

    const openEditDialog = () => {
        if (memoData) {
            setEditTitle(memoData.title);
            setEditDescription(memoData.description);
            setEditContent(memoData.content);
            setIsEditOpen(true);
        }
    };

    const saveEditedContent = async () => {
        if (typeof id === 'string' && memoData) {
            const docRef = doc(db, 'memos', id);
            await updateDoc(docRef, { title: editTitle, description: editDescription, content: editContent });
            setMemoData({ ...memoData, title: editTitle, description: editDescription, content: editContent });
            setIsEditOpen(false);
        }
    };

    if (loading) return <div className="w-full min-h-screen flex justify-center items-center"><Spinner size="xl" /></div>;

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
                        <div className="flex flex-col mb-5 justify-center text-center">
                            <Heading className="mb-2.5">{memoData.title}</Heading>
                            <Text>{memoData.description}</Text>
                            {memoData.userId !== currentUserId && authorData && (
                                <HStack spacing={3} className="mt-5 border p-1.5 rounded-md w-full mb-10">
                                    <Link href={`/user?id=${memoData.userId}`} passHref>
                                        <Avatar src={authorData.photoURL} name={authorData.displayName} size="md" />
                                    </Link>
                                    <VStack align="start" spacing={1}>
                                        <Link href={`/user?id=${memoData.userId}`} passHref>
                                            <Text fontWeight="bold">{authorData.displayName}</Text>
                                        </Link>
                                    </VStack>
                                </HStack>
                            )}
                        </div>
                        {memoData.userId === currentUserId && (
                            <div className='mt-5 mb-10 flex justify-end'>
                                <Menu>
                                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                                        Details
                                    </MenuButton>
                                    <MenuList>
                                        <MenuItem onClick={openEditDialog}>Edit</MenuItem>
                                        <MenuItem onClick={() => setIsOpen(true)}>Delete</MenuItem>
                                    </MenuList>
                                </Menu>
                                <AlertDialog
                                    isOpen={isOpen}
                                    leastDestructiveRef={cancelRef}
                                    onClose={onClose}
                                    isCentered
                                >
                                    <AlertDialogOverlay>
                                        <AlertDialogContent>
                                            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                                Delete Memo
                                            </AlertDialogHeader>
                                            <AlertDialogBody>
                                                Are you sure? You can&apos;t undo this action afterwards.
                                            </AlertDialogBody>
                                            <AlertDialogFooter>
                                                <Button ref={cancelRef} onClick={onClose}>
                                                    Cancel
                                                </Button>
                                                <Button colorScheme='red' onClick={deleteMemo} ml={3}>
                                                    Delete
                                                </Button>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialogOverlay>
                                </AlertDialog>
                                <AlertDialog
                                    isOpen={isEditOpen}
                                    leastDestructiveRef={cancelRef}
                                    onClose={onEditClose}
                                    isCentered
                                >
                                    <AlertDialogOverlay>
                                        <AlertDialogContent>
                                            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                                Edit Memo
                                            </AlertDialogHeader>
                                            <AlertDialogBody>
                                                <Input
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    placeholder="Edit your memo title here..."
                                                    size="sm"
                                                    mb={3}
                                                />
                                                <Input
                                                    value={editDescription}
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    placeholder="Edit your memo description here..."
                                                    size="sm"
                                                    mb={3}
                                                />
                                                <Textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    placeholder="Edit your memo content here..."
                                                    size="sm"
                                                    height="250px"
                                                />
                                            </AlertDialogBody>
                                            <AlertDialogFooter>
                                                <Button ref={cancelRef} onClick={onEditClose}>
                                                    Cancel
                                                </Button>
                                                <Button colorScheme='blue' onClick={saveEditedContent} ml={3}>
                                                    Save
                                                </Button>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialogOverlay>
                                </AlertDialog>
                            </div>
                        )}
                    </Layout>
                )}
                <Layout>
                    <div className="markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {memoData ? memoData.content : ''}
                        </ReactMarkdown>
                    </div>
                </Layout>
                <Divider className='my-10' />
                <Layout>
                    {typeof id === 'string' && (
                        <div>
                            <LikeButton memoId={id} />
                            <BookmarkButton memoId={id} />
                            <Comments memoId={id} />
                        </div>
                    )}
                </Layout>
            </div>
        </>
    );
};

export default Memo;