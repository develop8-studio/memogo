import { useState, ChangeEvent } from 'react';
import { db } from '@/firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { v4 as uuidv4 } from 'uuid';

const Editor = () => {
    const [content, setContent] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    const saveMemo = async () => {
        const uid = uuidv4(); // generate a unique id
        try {
            await addDoc(collection(db, 'memos'), {
                uid,
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
        <div className="container mx-auto p-4">
            <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                className="w-full p-2 border rounded mb-4"
                placeholder="Enter the title"
            />
            <textarea
                value={description}
                onChange={handleDescriptionChange}
                className="w-full p-2 border rounded mb-4"
                placeholder="Enter the description"
            />
            <textarea
                value={content}
                onChange={handleContentChange}
                className="w-full h-64 p-2 border rounded mb-4"
                placeholder="Write your markdown here..."
            />
            <button onClick={saveMemo} className="bg-blue-500 text-white px-4 py-2 rounded">
                Publish
            </button>
            <div className="mt-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export default Editor;