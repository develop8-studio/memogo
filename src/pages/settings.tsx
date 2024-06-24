import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { db, auth, storage } from '@/firebase/firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button, Input, Text, Textarea, Image } from '@chakra-ui/react';
import Layout from '@/components/Layout';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import Head from 'next/head';
import { FaUpload } from "react-icons/fa";

const AccountSettings = () => {
    useAuthRedirect();
    const [user, setUser] = useState<any>(null);
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [photoURL, setPhotoURL] = useState('');

    const currentUser = auth.currentUser;
    const router = useRouter();
    const fileInput = useRef<HTMLInputElement | null>(null);

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
                    setPhotoURL(userData.photoURL || '');
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
                setPhotoURL(photoURL);
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
            <Head>
                <title>Settings</title>
            </Head>
            <Layout>
                <div>
                    <Text className="mb-1">Name</Text>
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
                    {photoURL && (
                        <Image
                            src={photoURL}
                            alt="Profile Picture"
                            className="w-20 h-20 mb-5 rounded-full"
                        />
                    )}
                    <Button onClick={() => fileInput.current?.click()} className="w-full mb-5">
                        {/* <FaUpload className='text-gray-300 text-lg mr-1.5' /> */}
                        Upload Icon
                    </Button>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        ref={fileInput}
                        className="hidden"
                    />
                    <div className='flex space-x-3 w-full sm:w-fit-content'>
                        <Button onClick={updateProfile} colorScheme='green' disabled={uploading} className="w-full sm:w-auto">
                            {uploading ? 'Uploading...' : 'Update Profile'}
                        </Button>
                        <Button onClick={deleteAccount} colorScheme='red' className="w-full sm:w-auto">
                            Delete Account
                        </Button>
                    </div>
                </div>
            </Layout>
        </div>
    );
};

export default AccountSettings;