import { useState, useEffect } from 'react';
import { Box, Button, VStack, Text, Input, HStack, Spinner, Image } from '@chakra-ui/react';
import { auth, db } from '@/firebase/firebaseConfig';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

interface Island {
    id: string;
    name: string;
    owner: string;
}

const Island = () => {
    const [islands, setIslands] = useState<Island[]>([]);
    const [newIslandName, setNewIslandName] = useState<string>('');
    const [userIsland, setUserIsland] = useState<Island | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [creating, setCreating] = useState<boolean>(false);
    const [updating, setUpdating] = useState<boolean>(false);

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
            setCreating(true);
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
            } finally {
                setCreating(false);
            }
        }
    };

    const updateIsland = async (id: string, name: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setLoading(true);
            return;
        }
        setUpdating(true);
        try {
            const islandDoc = doc(db, 'islands', id);
            await updateDoc(islandDoc, {
                name
            });
            setUserIsland((prev) => (prev ? { ...prev, name } : null));
        } catch (err) {
            console.error('Failed to update island.', err);
        } finally {
            setUpdating(false);
        }
    };

    if (!auth.currentUser || loading) {
        return <div className="w-full min-h-screen flex justify-center items-center h-screen"><Spinner size="xl" /></div>;
    }

    if (userIsland) {
        return (
            <Box className="p-3 pt-0 bg-white rounded-md border">
                <div className="w-full flex items-center justify-center">
                    <Image src="/game/logo/management.png" className="w-[200px]" />
                </div>
                <div className="flex">
                    <Input
                        placeholder="新しい島の名前を入力してください。"
                        value={userIsland.name}
                        onChange={(e) => setUserIsland({ ...userIsland, name: e.target.value })}
                        className="mr-3"
                    />
                    <Button onClick={() => updateIsland(userIsland.id, userIsland.name)} colorScheme='teal' isLoading={updating}>
                        Update
                    </Button>
                </div>
                <Text className="text-xs text-slate-500 mt-1.5">ID: {userIsland.id}</Text>
            </Box>
        );
    }

    return (
        <Box className="p-3 pt-0 bg-white rounded-md border">
            <div className="w-full flex items-center justify-center">
                <Image src="/game/logo/management.png" className="w-[200px]" />
            </div>
            <div className="flex">
                <Input
                    value={newIslandName}
                    onChange={(e) => setNewIslandName(e.target.value)}
                    placeholder="島の名前を入力してください。"
                    className="mr-3"
                />
                <Button onClick={addIsland} colorScheme='teal' isLoading={creating}>
                    Create
                </Button>
            </div>
        </Box>
    );
};

export default Island;