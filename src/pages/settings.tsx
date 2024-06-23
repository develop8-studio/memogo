import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db, auth, storage } from '@/firebase/firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button, Divider, Heading, Input, Text, Textarea } from '@chakra-ui/react';
import Layout from '@/components/Layout';

const AccountSettings = () => {
    const [user, setUser] = useState<any>(null);
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const currentUser = auth.currentUser;
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            if (currentUser) {
                const docRef = doc(db, 'users', currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setUser(userData);
                    setDisplayName(userData.displayName);
                    setBio(userData.bio);
                }
            }
        };

        fetchUser();
    }, [currentUser]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const updateProfile = async () => {
        if (currentUser) {
            const docRef = doc(db, 'users', currentUser.uid);
            const updatedData: { [key: string]: any } = {
                displayName,
                bio,
            };

            if (file) {
                setUploading(true);
                const fileRef = ref(storage, `profilePictures/${currentUser.uid}/${file.name}`);
                await uploadBytes(fileRef, file);
                const photoURL = await getDownloadURL(fileRef);
                updatedData.photoURL = photoURL;
                setUploading(false);
            }

            await updateDoc(docRef, updatedData);
            alert('Profile updated!');
        }
    };

    const deleteAccount = async () => {
        if (currentUser) {
            await deleteDoc(doc(db, 'users', currentUser.uid));
            await deleteUser(currentUser);
            alert('Account deleted!');
            router.push('/register');
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="container mx-auto my-10">
            <Layout>
                <Heading size="md">Account Settings</Heading>
                <div className="mt-5">
                    <Text className="mb-1">Display Name</Text>
                    <Input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full mb-5"
                    />
                    <Text className="mb-1">Bio</Text>
                    <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full mb-5"
                    />
                    <Text className="mb-1">Profile Picture</Text>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="w-full p-3 border rounded-md mb-5"
                    />
                    <Button onClick={updateProfile} colorScheme='green' disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Update Profile'}
                    </Button>
                    <Button onClick={deleteAccount} className="mt-3 md:mt-0 md:ml-3" colorScheme='red'>
                        Delete Account
                    </Button>
                </div>
            </Layout>
        </div>
    );
};

export default AccountSettings;