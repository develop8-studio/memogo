import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { auth, db, storage } from '@/firebase/firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Layout from '@/components/Layout';
import { Input, Button, Spinner, Avatar, Box, Text, VStack, HStack, Flex, useColorModeValue } from '@chakra-ui/react';
import Head from 'next/head';

interface Message {
    id: string;
    text: string;
    senderId: string;
    timestamp: Timestamp;
    imageUrl?: string;
}

interface User {
    displayName: string;
    photoURL: string;
}

const Chat = () => {
    const router = useRouter();
    const { id } = router.query;
    const [messages, setMessages] = useState<Message[]>([]);
    const [userDetails, setUserDetails] = useState<{ [key: string]: User }>({});
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const currentUser = auth.currentUser;
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                    scrollToBottom();

                    // Fetch user details for each message
                    fetchedMessages.forEach(async (message) => {
                        if (!userDetails[message.senderId]) {
                            const userDocRef = doc(db, 'users', message.senderId);
                            const userDocSnap = await getDoc(userDocRef);
                            if (userDocSnap.exists()) {
                                setUserDetails((prevDetails) => ({
                                    ...prevDetails,
                                    [message.senderId]: userDocSnap.data() as User,
                                }));
                            }
                        }
                    });
                });

                return () => unsubscribe();
            } catch (err) {
                setError('Failed to fetch messages');
                console.error(err);
                setLoading(false);
            }
        };

        fetchMessages();
    }, [id, userDetails]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !currentUser) return;
        try {
            let imageUrl = '';
            if (image) {
                const imageRef = ref(storage, `chatRooms/${id}/${Date.now()}_${image.name}`);
                const uploadTask = uploadBytesResumable(imageRef, image);
                await new Promise<void>((resolve, reject) => {
                    uploadTask.on('state_changed', 
                        (snapshot) => {}, 
                        (error) => reject(error), 
                        () => {
                            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                                imageUrl = downloadURL;
                                resolve();
                            });
                        }
                    );
                });
            }

            await addDoc(collection(db, 'chatRooms', id as string, 'messages'), {
                text: newMessage,
                senderId: currentUser.uid,
                timestamp: new Date(),
                imageUrl
            });
            setNewMessage('');
            setImage(null);
            scrollToBottom();
        } catch (err) {
            setError('Failed to send message');
            console.error(err);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setImage(event.target.files[0]);
        }
    };

    const handleUserClick = (userId: string) => {
        router.push(`/user?id=${userId}`);
    };

    if (loading) return <div className="w-full min-h-screen flex justify-center items-center h-screen"><Spinner size="xl" /></div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="container mx-auto min-h-screen flex flex-col">
            <Head><title>Private Chat</title></Head>
            <Layout>
            <Box flex="1" overflowY="auto" className="md:p-5 mt-5 mb-[120px] md:mt-0 md:mb-0">
                    {messages.map((message) => (
                        <Box
                            key={message.id}
                            bg={message.senderId === currentUser?.uid ? 'blue.100' : 'gray.100'}
                            maxWidth="80%"
                            ml={message.senderId === currentUser?.uid ? 'auto' : '0'}
                            className="shadow-sm rounded-md mb-5 p-3"
                        >
                            <HStack mb={1} onClick={() => handleUserClick(message.senderId)} cursor="pointer">
                                <Avatar size="sm" src={userDetails[message.senderId]?.photoURL} name={userDetails[message.senderId]?.displayName} />
                                <Text fontSize="sm" fontWeight="bold">{userDetails[message.senderId]?.displayName}</Text>
                            </HStack>
                            <Text whiteSpace="pre-wrap">{message.text}</Text>
                            {message.imageUrl && (
                                <Box mt={2} display="flex" justifyContent={message.senderId === currentUser?.uid ? 'flex-end' : 'flex-start'}>
                                    <img src={message.imageUrl} alt="Image" className="max-w-full h-auto rounded-md" />
                                </Box>
                            )}
                            <Text textAlign="right" className="text-xs mt-5" color={message.senderId === currentUser?.uid ? 'blue.300' : 'gray.500'}>{new Date(message.timestamp.toDate()).toLocaleString()}</Text>
                        </Box>
                    ))}
                    <div ref={messagesEndRef} />
                </Box>
                <Box className="p-3 fixed md:sticky md:bottom-5 left-0 bottom-0 w-full bg-white border rounded-md shadow-md">
                    <HStack>
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            flex="1"
                        />
                        <label htmlFor="fileInput" className="hidden md:block">
                            <Button as="span" className="cursor-pointer bg-slate-100" variant="outline">
                                Select Image
                            </Button>
                        </label>
                        <input
                            id="fileInput"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className='hidden'
                        />
                        <Button onClick={sendMessage} colorScheme="blue">Send</Button>
                    </HStack>
                    <label htmlFor="fileInput" className="w-full block md:hidden">
                        <Button as="span" className="cursor-pointer w-full mt-2.5 bg-slate-100" variant="outline">
                            Select Image
                        </Button>
                    </label>
                </Box>
            </Layout>
        </div>
    );
};

export default Chat;