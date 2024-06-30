import { useState, useEffect } from 'react';
import { Box, Button, VStack, Text, Input, HStack, Spinner, Image } from '@chakra-ui/react';
import { auth, db } from '@/firebase/firebaseConfig';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';

interface Island {
    id: string;
    name: string;
    owner: string;
}

const Island = () => {
    const router = useRouter();
    const [islands, setIslands] = useState<Island[]>([]);
    const [newIslandName, setNewIslandName] = useState<string>('');
    const [userIsland, setUserIsland] = useState<Island | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchIslands = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                setLoading(true);
                return;
            }
            try {
                const q = query(collection(db, 'islands'));
                const querySnapshot = await getDocs(q);
                const islandsData: Island[] = [];
                querySnapshot.forEach((doc) => {
                    islandsData.push({ id: doc.id, ...doc.data() } as Island);
                });
                setIslands(islandsData);

                const userIslandQuery = query(collection(db, 'islands'), where('owner', '==', currentUser.uid));
                const userIslandSnapshot = await getDocs(userIslandQuery);
                if (!userIslandSnapshot.empty) {
                    const userIslandDoc = userIslandSnapshot.docs[0];
                    const islandData = userIslandDoc.data() as Island;
                    setUserIsland({ id: userIslandDoc.id, name: islandData.name, owner: islandData.owner });
                }
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch islands data.', err);
                setLoading(false);
            }
        };

        fetchIslands();
    }, []);

    const addIsland = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setLoading(true);
            return;
        }
        if (newIslandName.trim() && !userIsland) {
            try {
                const islandId = uuidv4();
                await addDoc(collection(db, 'islands'), {
                    name: newIslandName,
                    owner: currentUser.uid
                });

                setNewIslandName('');

                // Fetch the user's island again to update the state
                const userIslandQuery = query(collection(db, 'islands'), where('owner', '==', currentUser.uid));
                const userIslandSnapshot = await getDocs(userIslandQuery);
                if (!userIslandSnapshot.empty) {
                    const userIslandDoc = userIslandSnapshot.docs[0];
                    const islandData = userIslandDoc.data() as Island;
                    setUserIsland({ id: userIslandDoc.id, name: islandData.name, owner: islandData.owner });
                }
            } catch (err) {
                console.error('Failed to add new island.', err);
            }
        }
    };

    const updateIsland = async (id: string, name: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setLoading(true);
            return;
        }
        try {
            const islandDoc = doc(db, 'islands', id);
            await updateDoc(islandDoc, {
                name
            });
            setUserIsland((prev) => (prev ? { ...prev, name } : null));
        } catch (err) {
            console.error('Failed to update island.', err);
        }
    };

    if (!auth.currentUser || loading) {
        return <div className="w-full min-h-screen flex justify-center items-center h-screen"><Spinner size="xl" /></div>;
    }

    if (userIsland) {
        return (
            <Box p={4} bg="white" borderRadius="md" boxShadow="md">
                {/* <Image src="/game/logo/management.png" className="w-60" /> */}
                <Box p={4} border="1px" borderColor="gray.200" borderRadius="md">
                    <Text fontSize="lg" fontWeight="bold">{userIsland.name}</Text>
                    <HStack spacing={4} mt={2}>
                        <Input
                            placeholder="New name"
                            value={userIsland.name}
                            onChange={(e) => setUserIsland({ ...userIsland, name: e.target.value })}
                        />
                        <Button onClick={() => updateIsland(userIsland.id, userIsland.name)}>
                            Update
                        </Button>
                    </HStack>
                </Box>
            </Box>
        );
    }

    return (
        <Box p={4} bg="white" borderRadius="md" boxShadow="md">
            <Text fontSize="xl" mb={4}>Island Management</Text>
            <VStack align="stretch">
                <HStack>
                    <Input
                        value={newIslandName}
                        onChange={(e) => setNewIslandName(e.target.value)}
                        placeholder="New island name"
                    />
                    <Button onClick={addIsland}>Add Island</Button>
                </HStack>
            </VStack>
        </Box>
    );
};

export default Island;