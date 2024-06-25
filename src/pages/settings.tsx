import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { db, auth, storage } from '@/firebase/firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button, Input, Text, Textarea, Image, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Spinner } from '@chakra-ui/react';
import Layout from '@/components/Layout';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import Head from 'next/head';
import Cropper from 'react-easy-crop';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    AlertDialogCloseButton,
    useDisclosure,
} from '@chakra-ui/react';
import { FaUserCircle } from 'react-icons/fa';
import getCroppedImg from "@/utils/cropImage";

const Settings = () => {
    useAuthRedirect();
    const [user, setUser] = useState<any>(null);
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [photoURL, setPhotoURL] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const [isCropping, setIsCropping] = useState(false);

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
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setIsCropping(true);
        }
    };

    const onCropComplete = (croppedArea: any, croppedAreaPixels: { x: number, y: number, width: number, height: number }) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropConfirm = async () => {
        try {
            if (file && croppedAreaPixels && currentUser) {
                const croppedImg = await getCroppedImg(URL.createObjectURL(file), croppedAreaPixels);

                // 画像を即座にアップロードしてURLを取得
                const fileRef = ref(storage, `profilePictures/${currentUser.uid}/profile.jpg`);
                setUploading(true);
                await uploadBytes(fileRef, croppedImg);
                const photoURL = await getDownloadURL(fileRef);

                // プロファイルを更新
                const docRef = doc(db, 'users', currentUser.uid);
                await updateDoc(docRef, { photoURL });

                setPhotoURL(photoURL);
                setUploading(false);
                setIsCropping(false);
                setFile(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const updateProfile = async () => {
        if (currentUser) {
            const docRef = doc(db, 'users', currentUser.uid);
            const updatedData: { [key: string]: any } = {
                displayName,
                bio,
            };

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
                    <div className="contents lg:flex w-full">
                        <div className='w-[25%] sm:w-[20%] lg:w-[12.5%]'>
                            {photoURL ? (
                                <Image
                                    src={photoURL}
                                    alt="Profile Picture"
                                    className="w-auto h-auto rounded-full cursor-pointer"
                                    onClick={() => fileInput.current?.click()}
                                />
                            ) : (
                                <FaUserCircle
                                    className="w-auto h-auto rounded-full cursor-pointer text-slate-500"
                                    size="6em"
                                    onClick={() => fileInput.current?.click()}
                                />
                            )}
                        </div>
                        <div className="w-[87.5%] mt-3 lg:mt-0 lg:ml-5">
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
                                className="w-full mb-5"
                            />
                        </div>
                    </div>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        ref={fileInput}
                        className="hidden"
                    />
                    <div className='flex space-x-3 w-full sm:w-fit-content'>
                        <Button onClick={updateProfile} colorScheme='green' disabled={uploading} className="w-full sm:w-auto">
                            {uploading && <Spinner size="sm" className="mr-2" />}
                            {uploading ? 'Uploading...' : 'Update Profile'}
                        </Button>
                        <Button onClick={confirmDeleteAccount} colorScheme='red' className="w-full sm:w-auto">
                            Delete Account
                        </Button>
                    </div>
                </div>
            </Layout>
            <Modal isOpen={isCropping} onClose={() => setIsCropping(false)} isCentered size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Crop Image</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <div className="relative w-full h-64">
                            <Cropper
                                image={file ? URL.createObjectURL(file) : undefined}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => setIsCropping(false)} className='mr-3'>
                            Cancel
                        </Button>
                        <Button colorScheme='blue' onClick={handleCropConfirm}>
                            Confirm
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
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
                            Are you sure? You can&apos;t undo this action afterwards.
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

export default Settings;