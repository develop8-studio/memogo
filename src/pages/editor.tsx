import { useState, ChangeEvent, useEffect } from 'react';
import { db, auth } from '@/firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { v4 as uuidv4 } from 'uuid';
import { Button, Input, Textarea } from '@chakra-ui/react';
import { onAuthStateChanged } from 'firebase/auth';
import Layout from '@/components/Layout';
import Head from 'next/head';

const Editor = () => {
    const [content, setContent] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [userId, setUserId] = useState<string | null>(null);

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
        const uid = uuidv4(); // generate a unique id
        if (!userId) {
            alert('User not logged in');
            return;
        }

        try {
            await addDoc(collection(db, 'memos'), {
                uid,
                userId,
                title,
                description,
                content,
                createdAt: new Date()
            });
            alert('Memo saved!');
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
            <Button onClick={saveMemo} colorScheme='teal'>
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