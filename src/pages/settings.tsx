import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { db, auth, storage } from '@/firebase/firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { deleteUser, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Button, Input, Text, Textarea, Image, Spinner, Avatar, Heading, Divider, useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay } from '@chakra-ui/react';
import Layout from '@/components/Layout';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import Head from 'next/head';
import Cropper from 'react-easy-crop';
import getCroppedImg from "@/utils/cropImage";
import { FiTwitter } from 'react-icons/fi';

const Settings = () => {
    useAuthRedirect();
    const [user, setUser] = useState<any>(null);
    const [displayName, setDisplayName] = useState('');
    const [userID, setUserID] = useState('');
    const [bio, setBio] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [headerFile, setHeaderFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [photoURL, setPhotoURL] = useState('');
    const [headerPhotoURL, setHeaderPhotoURL] = useState('');
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [croppingHeader, setCroppingHeader] = useState(false);
    const [croppingAvatar, setCroppingAvatar] = useState(false);
    const [loading, setLoading] = useState(true);
    const [twitter, setTwitter] = useState('');
    const [userIDError, setUserIDError] = useState('');

    const toast = useToast();
    const { isOpen: isDeleteDialogOpen, onOpen: onOpenDeleteDialog, onClose: onCloseDeleteDialog } = useDisclosure();
    const cancelRef = useRef(null);

    const currentUser = auth.currentUser;
    const router = useRouter();
    const fileInput = useRef<HTMLInputElement | null>(null);
    const headerFileInput = useRef<HTMLInputElement | null>(null);
    const avatarFileInput = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (currentUser) {
                const docRef = doc(db, 'users', currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setUser(userData);
                    setDisplayName(userData.displayName);
                    setUserID(userData.userID || '');
                    setBio(userData.bio);
                    setPhotoURL(userData.photoURL || '');
                    setHeaderPhotoURL(userData.headerPhotoURL || '');
                    setTwitter(userData.twitter || '');
                }
                setLoading(false);
            }
        };

        fetchUser();
    }, [currentUser]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'header' | 'avatar') => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (type === 'header') {
                setHeaderFile(selectedFile);
                setCroppingHeader(true);
            } else if (type === 'avatar') {
                setFile(selectedFile);
                setCroppingAvatar(true);
            }
        }
    };

    const onCropComplete = (croppedArea: any, croppedAreaPixels: { x: number, y: number, width: number, height: number }) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropConfirm = async (type: 'header' | 'avatar') => {
        try {
            if ((file || headerFile) && croppedAreaPixels && currentUser) {
                const croppedImg = await getCroppedImg(URL.createObjectURL(type === 'header' ? headerFile! : file!), croppedAreaPixels);

                const fileRef = ref(storage, `${type === 'header' ? 'headerPictures' : 'profilePictures'}/${currentUser.uid}/${type}.jpg`);
                setUploading(true);
                await uploadBytes(fileRef, croppedImg);
                const imageURL = await getDownloadURL(fileRef);

                const docRef = doc(db, 'users', currentUser.uid);
                await updateDoc(docRef, { [type === 'header' ? 'headerPhotoURL' : 'photoURL']: imageURL });

                if (type === 'header') {
                    setHeaderPhotoURL(imageURL);
                    setCroppingHeader(false);
                    setHeaderFile(null);
                } else {
                    setPhotoURL(imageURL);
                    setCroppingAvatar(false);
                    setFile(null);
                }
                setUploading(false);
                toast({
                    title: `${type === 'header' ? 'Header' : 'Profile'} image updated successfully!`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: `Failed to update ${type === 'header' ? 'header' : 'profile'} image.`,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const checkUserIDAvailability = async () => {
        if (userID && userID !== user.userID) {
            const userQuery = query(collection(db, 'users'), where('userID', '==', userID));
            const querySnapshot = await getDocs(userQuery);
            if (!querySnapshot.empty) {
                setUserIDError('User ID is already taken');
                return false;
            }
        }
        setUserIDError('');
        return true;
    };

    const updateProfile = async () => {
        const isUserIDAvailable = await checkUserIDAvailability();
        if (!isUserIDAvailable) return;

        if (currentUser) {
            const docRef = doc(db, 'users', currentUser.uid);
            const updatedData: { [key: string]: any } = {
                displayName,
                bio,
                twitter,
                userID,
            };

            await updateDoc(docRef, updatedData);

            toast({
                title: "Profile updated successfully!",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const confirmDeleteAccount = () => {
        onOpenDeleteDialog();
    };

    const deleteAccount = async () => {
        if (currentUser) {
            await deleteDoc(doc(db, 'users', currentUser.uid));
            await deleteUser(currentUser);
            toast({
                title: "Account deleted successfully!",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            router.push('/register');
        }
    };

    const linkGoogleAccount = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            toast({
                title: "Google account linked successfully!",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Failed to link Google account.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const resetPassword = async () => {
        if (currentUser?.email) {
            try {
                await sendPasswordResetEmail(auth, currentUser.email);
                toast({
                    title: "Password reset email sent successfully!",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            } catch (error) {
                console.error(error);
                toast({
                    title: "Failed to send password reset email.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const deleteHeaderImage = async () => {
        if (currentUser && headerPhotoURL) {
            const fileRef = ref(storage, `headerPictures/${currentUser.uid}/header.jpg`);
            try {
                await deleteObject(fileRef);
                const docRef = doc(db, 'users', currentUser.uid);
                await updateDoc(docRef, { headerPhotoURL: '' });
                setHeaderPhotoURL('');
                toast({
                    title: "Header image deleted successfully!",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            } catch (error) {
                console.error(error);
                toast({
                    title: "Failed to delete header image.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    if (loading) return <div className="w-full min-h-screen flex justify-center items-center"><Spinner size="xl" /></div>;

    return (
        <div className="container mx-auto my-10">
            <Head>
                <title>Settings</title>
            </Head>
            <Layout>
                <div>
                    <input
                        type="file"
                        onChange={(e) => handleFileChange(e, 'avatar')}
                        ref={avatarFileInput}
                        className="hidden"
                    />
                    <input
                        type="file"
                        onChange={(e) => handleFileChange(e, 'header')}
                        ref={headerFileInput}
                        className="hidden"
                    />
                    <div className="flex flex-col w-full rounded-md p-5 border">
                        {headerPhotoURL ? (
                            <div className="w-fit h-fit border rounded-md overflow-hidden mb-5">
                                <Image src={headerPhotoURL} alt="Header Image" className="w-full object-cover cursor-pointer rounded-md h-32" onClick={() => headerFileInput.current?.click()} />
                            </div>
                        ) : (
                            <div className="w-full h-20 bg-gray-200 flex items-center justify-center cursor-pointer mb-5 rounded-md" onClick={() => headerFileInput.current?.click()}>
                                <Text>Click to set header image</Text>
                            </div>
                        )}
                        {headerPhotoURL && (
                            <Button onClick={deleteHeaderImage} colorScheme="red" variant="outline" className="mb-3">
                                Delete Header Image
                            </Button>
                        )}
                        <div className="flex flex-col lg:flex-row">
                            <div className="flex flex-col">
                                <Avatar src={photoURL} name={displayName} size="lg" className="cursor-pointer" onClick={() => avatarFileInput.current?.click()} />
                            </div>
                            <div className='w-full lg:ml-5 mt-3 lg:mt-0'>
                                <Text className="mb-1">Name</Text>
                                <Input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full mb-3"
                                />
                                <Text className="mb-1">User ID <span className="text-red-500">*</span></Text>
                                <Input
                                    type="text"
                                    value={userID}
                                    onChange={(e) => setUserID(e.target.value)}
                                    className="w-full mb-1"
                                />
                                {userIDError && <Text color="red.500" className="mb-3">{userIDError}</Text>}
                                <Text className="mb-1">Bio</Text>
                                <Textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full mb-3"
                                />
                                <Button onClick={updateProfile} colorScheme='green' disabled={uploading} className="w-full">
                                    {uploading && <Spinner size="sm" className="mr-2.5" />}
                                    {uploading ? 'Uploading...' : 'Update Profile'}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className='mt-[30px] flex flex-col border p-5 rounded-md space-y-3 w-full'>
                        <Heading size="md">Integration</Heading>
                        <div className="flex items-center">
                            <FiTwitter className="text-2xl mr-2.5" /><Input placeholder='Twitter Account' value={twitter} onChange={(e) => setTwitter(e.target.value)} />
                        </div>
                    </div>
                    <div className='mt-[30px] flex flex-col border p-5 rounded-md space-y-3 w-full'>
                        <Heading size="md">Account</Heading>
                        <Button onClick={resetPassword} className="w-full" variant="outline">
                            Reset Password
                        </Button>
                        <Button onClick={linkGoogleAccount} className="w-full" variant="outline">
                            Link Google Account
                        </Button>
                        <Divider className="my-3" />
                        <Heading size="md">Delete Account</Heading>
                        <Button onClick={confirmDeleteAccount} colorScheme='red' className="w-full">
                            Delete Account
                        </Button>
                    </div>
                </div>
            </Layout>
            <Modal isOpen={isCropping || croppingHeader} onClose={() => { setIsCropping(false); setCroppingHeader(false); }} isCentered size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Crop Header Image</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <div className="relative w-full h-[250px]">
                            <Cropper
                                image={headerFile ? URL.createObjectURL(headerFile) : undefined}
                                crop={crop}
                                zoom={zoom}
                                aspect={20 / 3}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => { setIsCropping(false); setCroppingHeader(false); }} className='mr-3'>
                            Cancel
                        </Button>
                        <Button colorScheme='blue' onClick={() => handleCropConfirm('header')}>
                            Confirm
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal isOpen={croppingAvatar} onClose={() => setCroppingAvatar(false)} isCentered size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Crop Icon Image</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <div className="relative w-full h-[250px]">
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
                        <Button onClick={() => setCroppingAvatar(false)} className='mr-3'>
                            Cancel
                        </Button>
                        <Button colorScheme='blue' onClick={() => handleCropConfirm('avatar')}>
                            Confirm
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <AlertDialog
                isOpen={isDeleteDialogOpen}
                leastDestructiveRef={cancelRef}
                onClose={onCloseDeleteDialog}
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
                            <Button ref={cancelRef} onClick={onCloseDeleteDialog}>
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