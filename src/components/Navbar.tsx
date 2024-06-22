import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '@/firebase/firebaseConfig';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Divider, Input } from "@chakra-ui/react";
import {
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
} from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react';

const Navbar = () => {
    const [user, setUser] = useState<User | null>(null);
    const [photoURL, setPhotoURL] = useState<string>('/default-avatar.png');
    const router = useRouter();
    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setPhotoURL(userDoc.data().photoURL || '/default-avatar.png');
                }
            } else {
                setUser(null);
                router.push('/login'); // ログインしていない場合は /login にリダイレクト
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    return (
        <>
            {/* <nav>
                <div className="container mx-auto flex justify-between">
                    <Link href="/">
                        <Image src="/memogo.png" alt="MemoGo Logo" width={100} height={100} className='mt-1.5 w-[40px] h-[40px] rounded-md' />
                    </Link>
                </div>
            </nav> */}
            <nav className="border-b p-2.5">
                <div className="container mx-auto flex justify-between items-center space-x-2.5">
                    <Image src="/memogo.png" alt="Memogo Logo" width={100} height={100} className='w-[45px] h-[40px]' onClick={onOpen} />
                    <Input placeholder="検索したいワードを入力..." />
                    <Button colorScheme="teal">検索</Button>
                    {user && (
                        <div className="flex items-center">
                            <Link href="/settings/account"><Image src={photoURL} alt="User Avatar" width={40} height={40} className='w-[45px] h-[40px] rounded-full border' /></Link>
                            {/* <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded ml-2">
                                Logout
                            </button> */}
                        </div>
                    )}
                </div>
            </nav>
            <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                <DrawerHeader borderBottomWidth='1px'><Link href="/"><Image src="/memogo.png" alt='' width={100} height={100} className="w-10" /></Link></DrawerHeader>
                <DrawerBody>
                    <div className="flex flex-col space-y-2.5 my-2.5">
                        <Link href="/editor" className='bg-slate-50 py-[10px] px-[15px] rounded-full hover:bg-slate-100 transition-colors'>Editor</Link>
                        <Link href="/bookmarks" className='bg-slate-50 py-[10px] px-[15px] rounded-full hover:bg-slate-100 transition-colors'>Bookmarks</Link>
                    </div>
                </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default Navbar;