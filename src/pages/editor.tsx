import { useState, ChangeEvent, useEffect } from 'react';
import { db, auth, storage } from '@/firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { v4 as uuidv4 } from 'uuid';
import { Button, Input, Textarea, useClipboard } from '@chakra-ui/react';
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
            alert('User not logged in');
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
            alert('Memo saved!');
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
            await uploadBytes(imageRef, image);
            const url = await getDownloadURL(imageRef);
            setImageUrl(url);
        }
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
                    className="w-full mb-3"
                    placeholder="Write your markdown here..."
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full mb-3 p-3 border rounded-md"
                />
                {imageUrl && (
                    <div className="flex">
                        <Input value={imageUrl} isReadOnly className="w-full mb-3" />
                        <Button onClick={onCopy} colorScheme='teal' className='ml-2.5'>
                            {hasCopied ? 'Copied' : 'Copy URL'}
                        </Button>
                    </div>
                )}
                <Button onClick={saveMemo} colorScheme='teal' mt={5}>
                    Publish
                </Button>
                <div className="mt-5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                    </ReactMarkdown>
                </div>
            </Layout>
        </div>
    );
};

export default Editor;