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
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Text,
    Spinner
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
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isSaveAlertOpen, setIsSaveAlertOpen] = useState(false);
    const [isValidationError, setIsValidationError] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const cancelRef = useRef<HTMLButtonElement>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

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
            setIsSaveAlertOpen(true);
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
            setIsSaveAlertOpen(true);
            setTitle('');
            setDescription('');
            setContent('');
            setImageUrl('');
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.error('Error adding document: ', e);
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
            setIsValidationError(true);
        } else {
            setIsAlertOpen(true);
        }
    };

    const onClose = () => {
        setIsAlertOpen(false);
        setIsSaveAlertOpen(false);
        setIsValidationError(false);
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
                <Input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    className="w-full mb-3"
                    placeholder="Enter the title"
                />
                <Textarea
                    value={description}
                    onChange={handleDescriptionChange}
                    className="w-full mb-3"
                    placeholder="Enter the description"
                />
                <Textarea
                    value={content}
                    onChange={handleContentChange}
                    className="w-full mb-5"
                    placeholder="Write your markdown here..."
                    height="200px"
                />
                <Button onClick={openFileDialog} className="w-full" disabled={isUploading}>
                    {isUploading ? <><Spinner size="sm" className="mr-2" />Uploading...</> : 'Upload Image'}
                </Button>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="hidden"
                />
                {imageUrl && (
                    <div className="flex mt-3">
                        <Input value={imageUrl} isReadOnly className="w-full" />
                        <Button onClick={onCopy} colorScheme='teal' className='ml-2.5'>
                            {hasCopied ? 'Copied' : 'Copy URL'}
                        </Button>
                    </div>
                )}
                <Button onClick={handlePublishClick} colorScheme='teal' className='my-5'>
                    Publish
                </Button>
                <Text>Preview</Text>
                <div className="markdown-body rounded-md border p-[30px]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                    </ReactMarkdown>
                </div>
            </Layout>

            <AlertDialog
                isOpen={isAlertOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
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
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="teal" onClick={saveMemo} ml={3}>
                                Publish
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            <AlertDialog
                isOpen={isSaveAlertOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Memo Saved
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Your memo has been saved successfully!
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                OK
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            <AlertDialog
                isOpen={isValidationError}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Validation Error
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Title, Description, and Content cannot be empty.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                OK
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </div>
    );
};

export default Editor;