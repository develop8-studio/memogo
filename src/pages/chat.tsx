import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import Layout from '@/components/Layout';
import { Input, Button, Spinner } from '@chakra-ui/react';
import Head from 'next/head';

interface Message {
    id: string;
    text: string;
    senderId: string;
    timestamp: any;
}

const Chat = () => {
    const router = useRouter();
    const { id } = router.query;
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const currentUser = auth.currentUser;

    useEffect(() => {
        if (!id || typeof id !== 'string') return;

        const fetchMessages = async () => {
            try {
                setLoading(true);
                const q = query(
                    collection(db, 'chatRooms', id, 'messages'),
                    orderBy('timestamp', 'asc')
                );

                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                    const fetchedMessages: Message[] = [];
                    querySnapshot.forEach((doc) => {
                        fetchedMessages.push({
                            id: doc.id,
                            ...doc.data()
                        } as Message);
                    });
                    setMessages(fetchedMessages);
                    setLoading(false);
                });

                return () => unsubscribe();
            } catch (err) {
                setError('Failed to fetch messages');
                console.error(err);
                setLoading(false);
            }
        };

        fetchMessages();
    }, [id]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !currentUser) return;
        try {
            await addDoc(collection(db, 'chatRooms', id as string, 'messages'), {
                text: newMessage,
                senderId: currentUser.uid,
                timestamp: new Date()
            });
            setNewMessage('');
        } catch (err) {
            setError('Failed to send message');
            console.error(err);
        }
    };

    if (loading) return <div className="w-full min-h-screen flex justify-center items-center h-screen"><Spinner size="xl" /></div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="container mx-auto my-10">
            <Head><title>Chat Room</title></Head>
            <Layout>
                <div className="p-4 border rounded-md mb-4 h-96 overflow-y-scroll">
                    {messages.map((message) => (
                        <div key={message.id} className={`mb-2 p-2 rounded-md ${message.senderId === currentUser?.uid ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <p>{message.text}</p>
                        </div>
                    ))}
                </div>
                <div className="flex">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                    />
                    <Button onClick={sendMessage} ml={2}>Send</Button>
                </div>
            </Layout>
        </div>
    );
};

export default Chat;