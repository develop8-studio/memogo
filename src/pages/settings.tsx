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
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    AlertDialogCloseButton,
    useDisclosure,
} from '@chakra-ui/react'

const AccountSettings = () => {
    useAuthRedirect();
    const [user, setUser] = useState<any>(null);
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [photoURL, setPhotoURL] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');

    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isDeleteOpen,
        onOpen: onDeleteOpen,
        onClose: onDeleteClose
    } = useDisclosure();

    const cancelRef = useRef(null);
    const deleteCancelRef = useRef(null);

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
            setDialogMessage('Profile updated!');
            onOpen();
        }
    };

    const confirmDeleteAccount = async () => {
        onDeleteOpen();
    };

    const deleteAccount = async () => {
        if (currentUser) {
            await deleteDoc(doc(db, 'users', currentUser.uid));
            await deleteUser(currentUser);
            setDialogMessage('Account deleted!');
            onOpen();
            router.push('/register');
        }
        onDeleteClose();
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="container mx-auto my-10">
            <Head>
                <title>Settings</title>
            </Head>
            <Layout>
                <div>
                    <div className="flex w-full">
                        <div className='w-1/6'>
                            {photoURL && (
                                <Image
                                    src={photoURL}
                                    alt="Profile Picture"
                                    className="w-auto h-auto mb-5 rounded-full"
                                />
                            )}
                        </div>
                        <div className="w-5/6 ml-3 lg:ml-5">
                            <Text className="mb-1">Name</Text>
                            <Input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full mb-3"
                            />
                            <Text className="mb-1">Bio</Text>
                            <Textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>
                    <Button onClick={() => fileInput.current?.click()} className="w-full my-5">
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
                        <Button onClick={confirmDeleteAccount} colorScheme='red' className="w-full sm:w-auto">
                            Delete Account
                        </Button>
                    </div>
                </div>
            </Layout>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            {dialogMessage.includes('deleted') ? 'Delete Account' : 'Profile Update'}
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            {dialogMessage}
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
                isOpen={isDeleteOpen}
                leastDestructiveRef={deleteCancelRef}
                onClose={onDeleteClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Delete Account
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure? You can't undo this action afterwards.
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={deleteCancelRef} onClick={onDeleteClose}>
                                Cancel
                            </Button>
                            <Button colorScheme='red' onClick={deleteAccount} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </div>
    );
};

export default AccountSettings;