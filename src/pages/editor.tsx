import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { db, auth, storage } from '@/firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { v4 as uuidv4 } from 'uuid';
import {
    Button,
    Input,
    Textarea,
    useClipboard,
    useToast,
    Text,
    Spinner,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Layout from '@/components/Layout';
import Head from 'next/head';
import useAuthRedirect from '@/hooks/useAuthRedirect';

const Editor = () => {
    useAuthRedirect();
    const [content, setContent] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [userId, setUserId] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const { onCopy, hasCopied } = useClipboard(imageUrl);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const toast = useToast();
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const saveMemo = async () => {
        if (!userId) {
            toast({
                title: "User not logged in",
                description: "Please log in to save your memo.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            await addDoc(collection(db, 'memos'), {
                userId,
                title,
                description,
                content,
                createdAt: new Date()
            });
            toast({
                title: "Memo Saved",
                description: "Your memo has been saved successfully!",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            setTitle('');
            setDescription('');
            setContent('');
            setImageUrl('');
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.error('Error adding document: ', e);
                toast({
                    title: "Error Saving Memo",
                    description: "There was an error saving your memo. Please try again.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    };

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
    };

    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const image = e.target.files[0];
            const imageRef = ref(storage, `images/${uuidv4()}`);
            setIsUploading(true);
            await uploadBytes(imageRef, image);
            const url = await getDownloadURL(imageRef);
            setImageUrl(url);
            setIsUploading(false);
        }
    };

    const handlePublishClick = () => {
        if (!title || !description || !content) {
            toast({
                title: "Validation Error",
                description: "Title, Description, and Content cannot be empty.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } else {
            setIsAlertOpen(true);
        }
    };

    const onCloseAlert = () => {
        setIsAlertOpen(false);
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="container mx-auto my-10">
            <Head>
                <title>Editor</title>
            </Head>
            <Layout>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="hidden"
                />
                <Tabs variant="enclosed">
                    <TabList>
                        <Tab>Markdown</Tab>
                        <Tab>Preview</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel padding="15px 0">
                            <div className="space-y-3">
                                <Input
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    className="w-full"
                                    placeholder="Enter the title"
                                />
                                <Textarea
                                    value={description}
                                    onChange={handleDescriptionChange}
                                    className="w-full"
                                    placeholder="Enter the description"
                                />
                                <Textarea
                                    value={content}
                                    onChange={handleContentChange}
                                    placeholder="Write your markdown here..."
                                    height="200px"
                                />
                                <Button onClick={openFileDialog} className="w-full" disabled={isUploading}>
                                    {isUploading ? <><Spinner size="sm" className="mr-2.5" />Uploading...</> : 'Upload Image'}
                                </Button>
                                {imageUrl && (
                                    <div className="flex">
                                        <Input value={imageUrl} isReadOnly className="w-full" />
                                        <Button onClick={onCopy} colorScheme='teal' className='ml-2.5'>
                                            {hasCopied ? 'Copied' : 'Copy URL'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabPanel>
                        <TabPanel padding="15px 0">
                            <div className="markdown-body rounded-md border p-[30px]">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {content}
                                </ReactMarkdown>
                            </div>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
                <Button onClick={handlePublishClick} colorScheme='teal'>
                    Publish
                </Button>
            </Layout>

            <AlertDialog
                isOpen={isAlertOpen}
                leastDestructiveRef={cancelRef}
                onClose={onCloseAlert}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Publish Memo
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to publish this memo?
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onCloseAlert}>
                                Cancel
                            </Button>
                            <Button colorScheme="teal" onClick={saveMemo} ml={3}>
                                Publish
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </div>
    );
};

export default Editor;